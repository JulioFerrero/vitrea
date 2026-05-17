import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, sites } from "@hi/database";
import { nanoid } from "nanoid";
import { getById, updateById, deleteById } from "./helpers";

export const sitesRoute = new Hono()
  .get("/", async (c) => {
    const all = await db.select().from(sites);
    return c.json(all);
  })
  .get("/:id", async (c) => {
    const row = await getById(sites, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  })
  .post(
    "/",
    zValidator("json", z.object({
      slug: z.string().min(1),
      data: z.record(z.unknown()).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.insert(sites).values({
        id: nanoid(),
        slug: body.slug,
        data: (body.data ?? { name: body.slug }) as any,
      }).returning();
      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      slug: z.string().min(1).optional(),
      data: z.record(z.unknown()).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const row = await updateById(sites, c.req.param("id"), { slug: body.slug, data: body.data as any });
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .delete("/:id", async (c) => {
    const row = await deleteById(sites, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });
