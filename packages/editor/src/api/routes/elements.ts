import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, elements } from "@hi/database";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const elementsRoute = new Hono()
  .get("/", async (c) => {
    const pageId = c.req.query("pageId");
    if (!pageId) return c.json({ error: "pageId required" }, 400);
    const all = await db.select().from(elements)
      .where(eq(elements.pageId, pageId))
      .orderBy(asc(elements.order));
    return c.json(all);
  })
  .get("/:id", async (c) => {
    const [row] = await db.select().from(elements).where(eq(elements.id, c.req.param("id")));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  })
  .get("/children/:parentId", async (c) => {
    const parentId = c.req.param("parentId");
    const all = await db.select().from(elements)
      .where(eq(elements.parentId, parentId))
      .orderBy(asc(elements.order));
    return c.json(all);
  })
  .post(
    "/",
    zValidator("json", z.object({
      pageId: z.string(),
      parentId: z.string().nullable().optional(),
      type: z.string().min(1),
      data: z.record(z.unknown()).optional(),
      styles: z.record(z.unknown()).optional(),
      order: z.number().optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.insert(elements).values({
        id: nanoid(),
        pageId: body.pageId,
        parentId: body.parentId ?? null,
        type: body.type,
        data: (body.data ?? {}) as any,
        styles: (body.styles ?? {}) as any,
        order: body.order ?? 0,
      }).returning();
      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      type: z.string().min(1).optional(),
      data: z.record(z.unknown()).optional(),
      styles: z.record(z.unknown()).optional(),
      order: z.number().optional(),
      parentId: z.string().nullable().optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.update(elements)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(elements.id, c.req.param("id")))
        .returning();
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .patch(
    "/reorder",
    zValidator("json", z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() })),
    })),
    async (c) => {
      const { items } = c.req.valid("json");
      for (const item of items) {
        await db.update(elements)
          .set({ order: item.order, updatedAt: new Date() })
          .where(eq(elements.id, item.id));
      }
      return c.json({ ok: true });
    }
  )
  .delete("/:id", async (c) => {
    const [row] = await db.delete(elements).where(eq(elements.id, c.req.param("id"))).returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });
