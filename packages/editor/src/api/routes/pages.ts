import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, pages, revisions } from "@vitrea/database";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getById, updateById, deleteById } from "./helpers";
import { cloneTree } from "@vitrea/render";
import type { PageContent, PageData } from "@vitrea/database";
import type { PageElement } from "@vitrea/render";

export const pagesRoute = new Hono()
  .get("/", async (c) => {
    const siteId = c.req.query("siteId");
    if (!siteId) return c.json({ error: "siteId required" }, 400);
    const all = await db.select({
      id: pages.id, siteId: pages.siteId, slug: pages.slug, data: pages.data, createdAt: pages.createdAt, updatedAt: pages.updatedAt,
    }).from(pages).where(eq(pages.siteId, siteId));
    return c.json(all);
  })
  .get("/:id", async (c) => {
    const row = await getById(pages, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  })
  .post(
    "/",
    zValidator("json", z.object({
      siteId: z.string(),
      slug: z.string().min(1),
      data: z.record(z.string(), z.unknown()).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const [row] = await db.insert(pages).values({
        id: nanoid(),
        siteId: body.siteId,
        slug: body.slug,
        data: (body.data ?? { title: body.slug, path: "/" + body.slug, status: "draft" }) as any,
      }).returning();
      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      slug: z.string().min(1).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
      content: z.any().optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.slug !== undefined) updates.slug = body.slug;
      if (body.data !== undefined) updates.data = body.data as any;
      if (body.content !== undefined) updates.content = body.content as PageContent[];
      const row = await updateById(pages, c.req.param("id"), updates as any);
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .delete("/:id", async (c) => {
    const row = await deleteById(pages, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  })
  .post("/:id/publish", async (c) => {
    const pageId = c.req.param("id");
    const page = await getById(pages, pageId);
    if (!page) return c.json({ error: "Page not found" }, 404);

    const content = page.content as PageElement[] | undefined;
    const snapshot: { content: PageElement[]; page: PageData } = {
      content: cloneTree(content ?? []),
      page: page.data as PageData,
    };

    await db.insert(revisions).values({
      id: nanoid(),
      pageId,
      snapshot: snapshot as any,
    });

    await db.update(pages).set({
      pubContent: content as any,
      data: { ...(page.data as Record<string, unknown>), status: "published" } as any,
      updatedAt: new Date(),
    }).where(eq(pages.id, pageId));

    return c.json({ ok: true });
  })
  .post("/:id/discard-draft", async (c) => {
    const pageId = c.req.param("id");
    const page = await getById(pages, pageId);
    if (!page) return c.json({ error: "Page not found" }, 404);

    await db.update(pages).set({
      content: page.pubContent as any,
      data: { ...(page.data as Record<string, unknown>), status: "published" } as any,
      updatedAt: new Date(),
    }).where(eq(pages.id, pageId));

    return c.json({ ok: true });
  })
  .get("/:id/diff", async (c) => {
    const page = await getById(pages, c.req.param("id"));
    if (!page) return c.json({ error: "Page not found" }, 404);

    const draft = (page.content ?? []) as PageElement[];
    const published = (page.pubContent ?? []) as PageElement[];

    const draftMap = new Map(draft.map((el) => [el.id, el]));
    const pubMap = new Map(published.map((el) => [el.id, el]));

    const addedElements = draft.filter((el) => !pubMap.has(el.id));
    const modifiedElements = draft.filter((el) => {
      const pub = pubMap.get(el.id);
      return pub && JSON.stringify(pub) !== JSON.stringify(el);
    });

    return c.json({
      draft,
      published,
      changes: {
        added: addedElements.length,
        modified: modifiedElements.length,
        addedElements,
        modifiedElements,
      },
    });
  })
  .get("/:id/revisions", async (c) => {
    const all = await db.select({ id: revisions.id, label: revisions.label, createdAt: revisions.createdAt })
      .from(revisions).where(eq(revisions.pageId, c.req.param("id"))).orderBy(desc(revisions.createdAt));
    return c.json(all);
  })
  .get("/:id/revisions/:revId", async (c) => {
    const [rev] = await db.select().from(revisions).where(eq(revisions.id, c.req.param("revId")));
    if (!rev) return c.json({ error: "Not found" }, 404);
    return c.json(rev);
  })
  .post("/:id/revisions/:revId/restore", async (c) => {
    const pageId = c.req.param("id");
    const [rev] = await db.select().from(revisions).where(eq(revisions.id, c.req.param("revId")));
    if (!rev) return c.json({ error: "Revision not found" }, 404);

    const snapshot = rev.snapshot as { content?: PageElement[] };
    if (!snapshot?.content) return c.json({ error: "Invalid snapshot" }, 400);

    await db.update(pages).set({
      content: snapshot.content as any,
      pubContent: snapshot.content as any,
      updatedAt: new Date(),
    }).where(eq(pages.id, pageId));

    return c.json({ ok: true });
  });
