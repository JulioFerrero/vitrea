import { page } from "fresh";
import { define } from "../utils.ts";
import { PageRenderer, type RenderElement } from "@hi/website";
import { db } from "@hi/database";
import { pages, elements } from "@hi/database";
import { eq, asc } from "drizzle-orm";
import { resolvePageReferences } from "../../../packages/website/src/lib/references.ts";

type PageData = { error: string | null; elements: RenderElement[] | null };

const fallbackElements: RenderElement[] = [
  { id: "s1", parentId: null, type: "section", order: 0, data: {}, styles: { width: "full", padding: "16", paddingX: "6" } },
  { id: "h1", parentId: "s1", type: "heading", order: 0, data: { content: "@hi/web", tagName: "h1" }, styles: { fontSize: "4xl", fontWeight: "bold" } },
  { id: "t1", parentId: "s1", type: "text", order: 1, data: { content: "Configure SITE_ID and seed the database to render pages." }, styles: { fontSize: "lg", color: "#6b7280" } },
];

export const handler = define.handlers({
  async GET(ctx) {
    const siteId = Deno.env.get("SITE_ID");
    if (!siteId) {
      return page({ error: "SITE_ID not configured", elements: null });
    }

    const slug = ctx.params.slug ?? "";
    const path = "/" + slug;
    const allPages = await db.select().from(pages).where(eq(pages.siteId, siteId));
    const found = allPages.find((p) => (p.data as Record<string, unknown>)?.path === (path === "" ? "/" : path));

    if (!found) {
      return page({ error: "Page not found: " + (path || "/"), elements: null });
    }

    const pageElements = await db.select().from(elements)
      .where(eq(elements.pageId, found.id))
      .orderBy(asc(elements.order));

    const renderElements: RenderElement[] = pageElements.map((e) => ({
      id: e.id,
      parentId: e.parentId,
      type: e.type,
      data: e.data ?? {},
      styles: e.styles ?? {},
      order: e.order,
    }));

    const resolved = await resolvePageReferences(renderElements);

    return page({ error: null, elements: resolved });
  },
});

export default define.page<typeof handler>(({ data }: { data: PageData }) => {
  if (!data.elements) {
    if (data.error) {
      return (
        <div class="flex min-h-screen items-center justify-center">
          <p class="text-lg text-gray-500">{data.error}</p>
        </div>
      );
    }
    return <PageRenderer elements={fallbackElements} />;
  }

  return <PageRenderer elements={data.elements} />;
});
