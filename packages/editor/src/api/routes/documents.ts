import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, documents } from "@vitrea/database";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getById, updateById, deleteById } from "./helpers";

export const documentsRoute = new Hono()
  .get("/", async (c) => {
    const collectionId = c.req.query("collectionId");
    const siteId = c.req.query("siteId");
    if (!collectionId && !siteId) return c.json({ error: "collectionId or siteId required" }, 400);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];
    if (collectionId) conditions.push(eq(documents.collectionId, collectionId));
    if (siteId) conditions.push(eq(documents.siteId, siteId));

    const filterRegex = /filter\[(.+?)\]/;
    const rawQueries = c.req.queries();
    if (rawQueries) {
      for (const [key, values] of Object.entries(rawQueries)) {
        const match = key.match(filterRegex);
        if (match && match[1] && values?.[0]) {
          conditions.push(sql`(data->>${match[1]}) = ${String(values[0])}`);
        }
      }
    }

    const all = await db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.updatedAt));

    const selectParam = c.req.query("select");
    if (selectParam) {
      const fields = selectParam.split(",").map((f) => f.trim()).filter(Boolean);
      const projected = all.map((doc) => {
        const projectedData: Record<string, unknown> = {};
        for (const f of fields) {
          projectedData[f] = (doc.data as Record<string, unknown>)[f];
        }
        return { ...doc, data: projectedData };
      });
      return c.json(projected);
    }

    return c.json(all);
  })
  .get("/:id", async (c) => {
    const row = await getById(documents, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  })
  .post(
    "/",
    zValidator("json", z.object({
      collectionId: z.string(),
      siteId: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
      status: z.enum(["draft", "published"]).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.insert(documents).values({
        id: nanoid(),
        collectionId: body.collectionId,
        siteId: body.siteId,
        data: (body.data ?? {}) as Record<string, unknown>,
        status: body.status ?? "draft",
      }).returning();
      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      data: z.record(z.string(), z.unknown()).optional(),
      status: z.enum(["draft", "published"]).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const existing = await getById(documents, c.req.param("id"));
      if (!existing) return c.json({ error: "Not found" }, 404);

      const mergedData = body.data
        ? { ...(existing.data as Record<string, unknown>), ...(body.data as Record<string, unknown>) }
        : undefined;

      const row = await updateById(documents, c.req.param("id"), {
        ...(mergedData ? { data: mergedData } : {}),
        ...(body.status ? { status: body.status } : {}),
      } as Record<string, unknown>);
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .delete("/:id", async (c) => {
    const row = await deleteById(documents, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });

export const batchDocumentsRoute = new Hono()
  .post(
    "/",
    zValidator("json", z.object({
      ids: z.array(z.string()).min(1),
    })),
    async (c) => {
      const { ids } = c.req.valid("json");
      const found = await db.select().from(documents).where(inArray(documents.id, ids));
      return c.json(found);
    }
  );
