import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, files } from "@hi/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const filesRoute = new Hono()
  .get("/", async (c) => {
    const siteId = c.req.query("siteId");
    if (!siteId) return c.json({ error: "siteId required" }, 400);
    const all = await db.select().from(files).where(eq(files.siteId, siteId));
    return c.json(all);
  })
  .post(
    "/",
    zValidator("json", z.object({
      siteId: z.string(),
      data: z.record(z.unknown()),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.insert(files).values({
        id: nanoid(),
        siteId: body.siteId,
        data: body.data as any,
      }).returning();
      return c.json(row, 201);
    }
  )
  .delete("/:id", async (c) => {
    const [row] = await db.delete(files).where(eq(files.id, c.req.param("id"))).returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });
