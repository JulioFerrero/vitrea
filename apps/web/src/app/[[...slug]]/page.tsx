import { db, pages } from "@vitrea/database";
import { eq } from "drizzle-orm";
import { PageRenderer, type RenderElement } from "@internal/web";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const siteId = process.env.SITE_ID ?? process.env.WEBSITE_ID;

  if (!siteId) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-white/60">
        SITE_ID or WEBSITE_ID is not configured
      </div>
    );
  }

  const path = "/" + (slug?.join("/") ?? "");
  const normalizedPath = path === "//" ? "/" : path;

  const allPages = await db.select().from(pages).where(eq(pages.siteId, siteId));
  const page = allPages.find((entry: (typeof allPages)[number]) => {
    const data = entry.data as Record<string, unknown> | null;
    return (data?.path as string | undefined) === normalizedPath;
  });

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-white/60">
        Page not found: {normalizedPath}
      </div>
    );
  }

  const renderElements = ((page.pubContent ?? page.content ?? []) as RenderElement[]).map((entry) => ({
    ...entry,
    data: entry.data ?? {},
    styles: entry.styles ?? {},
    children: entry.children ?? [],
  }));

  return <PageRenderer content={renderElements} />;
}
