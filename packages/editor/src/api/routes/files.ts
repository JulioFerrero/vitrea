import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, files } from "@vitrea/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { uploadFile, deleteFile, extractKeyFromUrl } from "../../lib/storage";

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
      data: z.record(z.string(), z.unknown()),
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
  .post("/upload", async (c) => {
    const formData = await c.req.formData();
    const siteId = formData.get("siteId")?.toString();
    const file = formData.get("file") as File | null;

    if (!siteId) return c.json({ error: "siteId required" }, 400);
    if (!file) return c.json({ error: "file required" }, 400);

    const uploaded = await uploadFile(file);

    const fileId = nanoid();
    const [row] = await db.insert(files).values({
      id: fileId,
      siteId,
      data: {
        url: uploaded.url,
        name: uploaded.name,
        type: uploaded.type,
        width: 0,
        height: 0,
      },
    }).returning();

    return c.json(row, 201);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    const fileData = row.data as { url?: string } | null;
    if (fileData?.url) {
      const key = extractKeyFromUrl(fileData.url);
      if (key) {
        try { await deleteFile(key); } catch { /* ignore S3 errors */ }
      }
    }

    await db.delete(files).where(eq(files.id, id));
    return c.json({ ok: true });
  })
  .patch("/:id", zValidator("json", z.object({
    data: z.record(z.string(), z.unknown()).optional(),
  })), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [existing] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    if (!existing) return c.json({ error: "Not found" }, 404);

    const updated = (body.data as Record<string, unknown> | undefined) ?? {};
    const currentData = { ...(existing.data as Record<string, unknown> ?? {}) };
    for (const [k, v] of Object.entries(updated)) {
      (currentData as Record<string, unknown>)[k] = v;
    }

    await db.update(files).set({ data: currentData as any }).where(eq(files.id, id));
    const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return c.json(row);
  });
