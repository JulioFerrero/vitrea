import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, collections } from "@hi/database";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getById, updateById, deleteById } from "./helpers";

export const collectionsRoute = new Hono()
  .get("/", async (c) => {
    const siteId = c.req.query("siteId");
    if (!siteId) return c.json({ error: "siteId required" }, 400);
    const all = await db.select().from(collections).where(eq(collections.siteId, siteId));
    return c.json(all);
  })
  .get("/:id", async (c) => {
    const row = await getById(collections, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  })
  .post(
    "/",
    zValidator("json", z.object({
      siteId: z.string(),
      name: z.string().min(1),
      label: z.string().min(1),
      icon: z.string().optional(),
      fields: z.array(z.record(z.unknown())).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const existing = await db.select().from(collections)
        .where(and(eq(collections.siteId, body.siteId), eq(collections.name, body.name)));
      if (existing.length > 0) {
        return c.json({ error: "Collection already exists" }, 409);
      }
      const [row] = await db.insert(collections).values({
        id: nanoid(),
        siteId: body.siteId,
        name: body.name,
        label: body.label,
        icon: body.icon ?? "folder",
        fields: (body.fields ?? []) as Record<string, unknown>[],
      }).returning();
      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      label: z.string().min(1).optional(),
      icon: z.string().optional(),
      fields: z.array(z.record(z.unknown())).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const row = await updateById(collections, c.req.param("id"), body as Record<string, unknown>);
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .delete("/:id", async (c) => {
    const row = await deleteById(collections, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });
