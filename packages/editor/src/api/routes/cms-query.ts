import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, documents, collections } from "@vitrea/database";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";

type FilterOp = "==" | "!=" | "<" | ">" | "<=" | ">=" | "in" | "nin" | "contains" | "startsWith" | "endsWith";

const querySpecSchema = z.object({
  collection: z.string().min(1),
  where: z.array(z.object({
    field: z.string(),
    op: z.enum(["==", "!=", "<", ">", "<=", ">=", "in", "nin", "contains", "startsWith", "endsWith"]),
    value: z.unknown(),
  })).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.object({ field: z.string(), dir: z.enum(["asc", "desc"]) }).optional(),
  include: z.array(z.object({
    field: z.string(),
    select: z.array(z.string()).optional(),
    include: z.array(z.any()).optional(),
  })).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

function buildJsonPath(field: string): ReturnType<typeof sql> {
  return sql.raw(`data->>'${field}'`);
}

function operatorToSql(
  field: string,
  op: FilterOp,
  value: unknown,
): ReturnType<typeof sql> | null {
  const path = buildJsonPath(field);

  switch (op) {
    case "==": return sql`(${path}) = ${String(value)}`;
    case "!=": return sql`(${path}) != ${String(value)}`;
    case "<": return sql`(${path})::numeric < ${Number(value)}`;
    case ">": return sql`(${path})::numeric > ${Number(value)}`;
    case "<=": return sql`(${path})::numeric <= ${Number(value)}`;
    case ">=": return sql`(${path})::numeric >= ${Number(value)}`;
    case "contains": return sql`(${path}) ILIKE ${"%" + String(value) + "%"}`;
    case "startsWith": return sql`(${path}) ILIKE ${String(value) + "%"}`;
    case "endsWith": return sql`(${path}) ILIKE ${"%" + String(value)}`;
    case "in": {
      const vals = Array.isArray(value) ? value : [value];
      if (vals.length === 0) return null;
      const chunks = vals.map((v) => sql`${String(v)}`);
      return sql`(${sql.raw(`data->>'${field}'`)}) IN (${sql.join(chunks, sql`, `)})`;
    }
    case "nin": {
      const vals = Array.isArray(value) ? value : [value];
      if (vals.length === 0) return null;
      const chunks = vals.map((v) => sql`${String(v)}`);
      return sql`(${sql.raw(`data->>'${field}'`)}) NOT IN (${sql.join(chunks, sql`, `)})`;
    }
    default: return null;
  }
}

export const cmsQueryRoute = new Hono()
  .post(
    "/",
    zValidator("json", querySpecSchema),
    async (c) => {
      const spec = c.req.valid("json");

      const [collection] = await db.select().from(collections).where(eq(collections.name, spec.collection));
      if (!collection) return c.json({ error: `Collection "${spec.collection}" not found` }, 404);

      const resolvedFields = collection.fields as Record<string, unknown>[] ?? [];
      const fieldNames = resolvedFields.map((f) => f.name as string);

      for (const sel of (spec.select ?? [])) {
        if (!fieldNames.includes(sel)) {
          return c.json({ error: `Field "${sel}" not found in collection "${spec.collection}"` }, 400);
        }
      }
      if (spec.orderBy && !fieldNames.includes(spec.orderBy.field)) {
        return c.json({ error: `Order field "${spec.orderBy.field}" not found` }, 400);
      }

      if (spec.where) {
        for (const w of spec.where) {
          if (!fieldNames.includes(w.field)) {
            return c.json({ error: `Field "${w.field}" not found in collection "${spec.collection}"` }, 400);
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conditions: any[] = [eq(documents.collectionId, collection.id)];

      if (spec.where) {
        for (const w of spec.where) {
          const sqlOp = operatorToSql(w.field, w.op as FilterOp, w.value);
          if (sqlOp) conditions.push(sqlOp);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = db.select().from(documents).where(and(...conditions)) as any;

      if (spec.orderBy) {
        const orderFn = spec.orderBy.dir === "desc" ? desc : asc;
        query = query.orderBy(orderFn(sql.raw(`data->>'${spec.orderBy.field}'`)));
      }

      if (spec.limit) {
        query = query.limit(spec.limit);
      }
      if (spec.offset) {
        query = query.offset(spec.offset);
      }

      const rows = await query;

      const rawItems = rows as Array<{
        id: string;
        collectionId: string;
        siteId: string;
        data: Record<string, unknown>;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;

      const items = rawItems.map((row) => {
        if (!spec.select || spec.select.length === 0) return row;

        const projected: Record<string, unknown> = {};
        for (const field of spec.select) {
          projected[field] = row.data[field];
        }
        return { ...row, data: projected };
      });

      if (spec.include) {
        const allRefIds = new Set<string>();
        for (const include of spec.include) {
          for (const item of items) {
            const refValue = (item.data as Record<string, unknown>)[include.field];
            if (!refValue) continue;
            const refIds = Array.isArray(refValue) ? refValue as string[] : [refValue as string];
            for (const id of refIds) allRefIds.add(id);
          }
        }

        if (allRefIds.size > 0) {
          const idArray = [...allRefIds];
          const allRefDocs = await db.select().from(documents).where(
            inArray(documents.id, idArray),
          );

          const docMap = new Map(allRefDocs.map((d) => [d.id, d]));

          for (const include of spec.include) {
            for (const item of items) {
              const refValue = (item.data as Record<string, unknown>)[include.field];
              if (!refValue) continue;

              const isArray = Array.isArray(refValue);
              const refIds = isArray ? refValue as string[] : [refValue as string];
              const refDocs = refIds.map((id) => docMap.get(id)).filter(Boolean) as typeof allRefDocs;

              if (include.select && include.select.length > 0) {
                const projected = refDocs.map((d) => {
                  const p: Record<string, unknown> = {};
                  for (const f of include.select!) {
                    p[f] = (d.data as Record<string, unknown>)?.[f];
                  }
                  return { _id: d.id, ...p };
                });
                (item.data as Record<string, unknown>)[include.field] = isArray
                  ? projected
                  : projected[0];
              } else {
                (item.data as Record<string, unknown>)[include.field] = isArray
                  ? refDocs
                  : refDocs[0];
              }
            }
          }
        }
      }

      return c.json({ items, total: items.length });
    }
  );
