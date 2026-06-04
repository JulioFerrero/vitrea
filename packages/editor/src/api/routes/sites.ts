import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, sites, pages, siteMembers } from "@vitrea/database";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getById, updateById, deleteById } from "./helpers";
import { createElement } from "@vitrea/render";
import type { PageElement } from "@vitrea/render";
import type { AuthVariables } from "@vitrea/auth/middleware";
import type { PageContent, SiteData } from "@vitrea/database";

function el(type: string, data: Record<string, unknown> = {}, styles: Record<string, string> = {}, children: PageElement[] = []): PageElement {
  return createElement(type, data, styles, children);
}

function generateTemplateContent(template: string): PageElement[] {
  if (template === "landing") {
    return [
      el("nav-bar", { brandName: "Web Builder", link1Text: "Features", link1Href: "#features", link2Text: "About", link2Href: "#about", ctaText: "Get Started", ctaHref: "#" }),
      el("hero-section", { badge: "Self-hosted & Open Source", headline: "Build beautiful\nwebsites. Visually.", subheadline: "A powerful visual builder with atomic elements, CMS collections, and real-time preview.", ctaText: "Start Building", ctaHref: "#", secondaryCtaText: "View Docs", secondaryCtaHref: "#" }),
      el("features-section", { headline: "Why Web Builder?", subtitle: "Everything you need to build and manage professional websites.", features: [{ title: "Visual Editor", description: "Build pages with drag-and-drop atomic elements." }, { title: "Self-hosted", description: "Runs on your own server. Your data, your control." }, { title: "Built-in CMS", description: "Define collections, manage documents, reference content anywhere." }, { title: "Theming & Styles", description: "Rich style controls for every element." }] }),
      el("showcase-section", { headline: "Design with precision", description: "A powerful visual editor with full control over every element.", ctaText: "Try the editor", ctaHref: "#", imageSrc: "https://placehold.co/800x500/171717/525252?text=Web+Builder+UI", imageAlt: "Web Builder Interface", variant: "image-right" }),
      el("cta-section", { headline: "Ready to build something great?", description: "Start creating beautiful pages today.", ctaText: "Get Started Free", ctaHref: "#" }),
      el("footer-section", { brandName: "Web Builder", description: "The self-hosted visual website builder.", copyrightText: "© 2026 Web Builder.", link1Text: "GitHub", link1Href: "https://github.com", link2Text: "Docs", link2Href: "/docs", link3Text: "Features", link3Href: "#features" }),
    ];
  }

  if (template === "blog") {
    return [
      el("nav-bar", { brandName: "Web Builder", link1Text: "Blog", link1Href: "#", link2Text: "About", link2Href: "#about" }),
      el("hero-section", { headline: "Thoughts & Stories", subheadline: "Design, development, and creativity." }),
      el("features-section", { headline: "Latest Posts", subtitle: "Recent articles about web design and development.", features: [{ title: "Getting Started", description: "Build your first website with Web Builder." }, { title: "Design Systems", description: "Create consistent design systems with atomic elements." }, { title: "Self-hosting", description: "Deploy on your own VPS with Docker." }, { title: "CMS Deep Dive", description: "Build content collections with the built-in CMS." }] }),
      el("footer-section", { brandName: "Web Builder", description: "The self-hosted visual website builder.", copyrightText: "© 2026 Web Builder.", link1Text: "GitHub", link1Href: "https://github.com", link2Text: "Docs", link2Href: "/docs" }),
    ];
  }

  if (template === "portfolio") {
    return [
      el("nav-bar", { brandName: "Web Builder", link1Text: "Work", link1Href: "#work", link2Text: "About", link2Href: "#about", ctaText: "Hire Me", ctaHref: "#" }),
      el("hero-section", { headline: "Creative\nPortfolio", subheadline: "A curated showcase of design and development projects.", ctaText: "View Work", ctaHref: "#work", secondaryCtaText: "About Me", secondaryCtaHref: "#about" }),
      el("showcase-section", { headline: "Featured Project", description: "A complete brand identity and website redesign.", ctaText: "View case study", ctaHref: "#", imageSrc: "https://placehold.co/800x500/171717/818cf8?text=Featured+Project", imageAlt: "Featured Project", variant: "image-right" }),
      el("features-section", { headline: "Services", subtitle: "What I can help you with.", features: [{ title: "Web Design", description: "Complete website design from wireframes to mockups." }, { title: "Development", description: "Full-stack development with modern frameworks." }, { title: "Brand Identity", description: "Logo, color systems, and typography." }] }),
      el("cta-section", { headline: "Let's work together", description: "Have a project in mind?", ctaText: "Get in Touch", ctaHref: "#" }),
      el("footer-section", { brandName: "Web Builder", description: "Built with Web Builder.", copyrightText: "© 2026.", link1Text: "GitHub", link1Href: "https://github.com", link2Text: "Twitter", link2Href: "https://twitter.com" }),
    ];
  }

  if (template === "minimal") {
    return [
      // Navigation
      el("nav-bar", {
        brandName: "Studio",
        link1Text: "Work", link1Href: "#work",
        link2Text: "Services", link2Href: "#services",
        link3Text: "Contact", link3Href: "#contact",
        ctaText: "Start a project", ctaHref: "#contact",
        theme: "light",
      }),

      // Hero — split layout: typography left, image right
      el("showcase-section", {
        headline: "We design digital\nproducts people\nlove to use.",
        description: "A focused design studio partnering with ambitious teams to create brand identities, product interfaces, and design systems that stand the test of time.",
        ctaText: "View our work", ctaHref: "#work",
        imageSrc: "https://placehold.co/800x600/f8f7f6/94918e?text=Studio+Work",
        imageAlt: "Studio project showcase",
        variant: "image-right",
        theme: "light",
      }, { padding: "60px 0 0 0", backgroundColor: "#ffffff" }),

      // Services — custom section with primitives
      el("section", {}, { padding: "120px 0", backgroundColor: "#ffffff" }, [
        el("text", { content: "Services", tagName: "span" }, {
          fontSize: "11px", fontWeight: "600", color: "#a09c98",
          letterSpacing: "0.12em", textTransform: "uppercase",
          maxWidth: "680px", marginLeft: "auto", marginRight: "auto",
          marginBottom: "40px", padding: "0 40px", display: "block",
        }),
        el("heading", { content: "What we do best.", tagName: "h2" }, {
          fontSize: "clamp(28px,4vw,42px)", fontWeight: "400", color: "#1a1a1a",
          lineHeight: "1.2", letterSpacing: "-0.02em",
          maxWidth: "680px", marginLeft: "auto", marginRight: "auto",
          marginBottom: "64px", padding: "0 40px",
        }),
        el("divider", {}, { maxWidth: "680px", marginLeft: "auto", marginRight: "auto", padding: "0 40px", borderColor: "#e8e6e3", marginBottom: "48px" }),
        el("row", {}, { maxWidth: "680px", marginLeft: "auto", marginRight: "auto", padding: "0 40px", display: "flex", flexDirection: "column", gap: "48px" }, [
          el("column", {}, { display: "flex", gap: "16px" }, [
            el("text", { content: "01", tagName: "span" }, { fontSize: "13px", fontWeight: "500", color: "#c4c1bd", fontFamily: "monospace", minWidth: "32px" }),
            el("column", {}, { display: "flex", flexDirection: "column", gap: "6px" }, [
              el("heading", { content: "Brand identity", tagName: "h3" }, { fontSize: "18px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "-0.01em" }),
              el("text", { content: "Strategy, naming, visual identity, and guidelines. We build systems that last beyond trends.", tagName: "p" }, { fontSize: "14px", color: "#8c8c8c", lineHeight: "1.6", maxWidth: "480px" }),
            ]),
          ]),
          el("column", {}, { display: "flex", gap: "16px" }, [
            el("text", { content: "02", tagName: "span" }, { fontSize: "13px", fontWeight: "500", color: "#c4c1bd", fontFamily: "monospace", minWidth: "32px" }),
            el("column", {}, { display: "flex", flexDirection: "column", gap: "6px" }, [
              el("heading", { content: "Product design", tagName: "h3" }, { fontSize: "18px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "-0.01em" }),
              el("text", { content: "Digital products that feel inevitable. From concept to component, we ship interfaces that work.", tagName: "p" }, { fontSize: "14px", color: "#8c8c8c", lineHeight: "1.6", maxWidth: "480px" }),
            ]),
          ]),
          el("column", {}, { display: "flex", gap: "16px" }, [
            el("text", { content: "03", tagName: "span" }, { fontSize: "13px", fontWeight: "500", color: "#c4c1bd", fontFamily: "monospace", minWidth: "32px" }),
            el("column", {}, { display: "flex", flexDirection: "column", gap: "6px" }, [
              el("heading", { content: "Design systems", tagName: "h3" }, { fontSize: "18px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "-0.01em" }),
              el("text", { content: "Scalable component libraries, tokens, and documentation that keep teams aligned as they grow.", tagName: "p" }, { fontSize: "14px", color: "#8c8c8c", lineHeight: "1.6", maxWidth: "480px" }),
            ]),
          ]),
        ]),
      ]),

      // Featured work — showcase component
      el("showcase-section", {
        headline: "Selected work",
        description: "Fintech platform redesign. A complete visual overhaul for a trading platform used by thousands of professionals daily.",
        ctaText: "Read case study", ctaHref: "#",
        imageSrc: "https://placehold.co/700x500/f0efed/94918e?text=Case+Study+01",
        imageAlt: "Fintech platform screenshot",
        variant: "image-left",
        theme: "light",
      }, { padding: "120px 0", backgroundColor: "#f8f7f6" }),

      // More work — image grid with primitives
      el("section", {}, { padding: "120px 0", backgroundColor: "#ffffff" }, [
        el("text", { content: "More projects", tagName: "span" }, {
          fontSize: "11px", fontWeight: "600", color: "#a09c98",
          letterSpacing: "0.12em", textTransform: "uppercase",
          maxWidth: "1100px", marginLeft: "auto", marginRight: "auto",
          marginBottom: "48px", padding: "0 40px", display: "block",
        }),
        el("image", { src: "https://placehold.co/1100x460/f0efed/94918e?text=E-commerce+Platform+Redesign", alt: "E-commerce project" }, {
          width: "calc(100% - 80px)", maxWidth: "1100px", borderRadius: "8px",
          marginLeft: "auto", marginRight: "auto", marginBottom: "12px",
        }),
        el("text", { content: "E-commerce platform — complete UI redesign and checkout flow optimization", tagName: "span" }, {
          fontSize: "13px", color: "#8c8c8c", maxWidth: "1100px",
          marginLeft: "auto", marginRight: "auto", marginBottom: "48px", padding: "0 40px", display: "block",
        }),
        el("image", { src: "https://placehold.co/1100x460/f0efed/94918e?text=Healthcare+App+Design", alt: "Healthcare project" }, {
          width: "calc(100% - 80px)", maxWidth: "1100px", borderRadius: "8px",
          marginLeft: "auto", marginRight: "auto", marginBottom: "12px",
        }),
        el("text", { content: "Healthcare app — patient portal experience designed for clarity and trust", tagName: "span" }, {
          fontSize: "13px", color: "#8c8c8c", maxWidth: "1100px",
          marginLeft: "auto", marginRight: "auto", padding: "0 40px", display: "block",
        }),
      ]),

      // CTA
      el("cta-section", {
        headline: "Have a project\nin mind?",
        description: "We take on a few projects each quarter. Tell us about yours and we'll see if we're a fit.",
        ctaText: "Get in touch", ctaHref: "#contact",
        theme: "light",
      }, { padding: "120px 0", backgroundColor: "#f8f7f6" }),

      // Footer
      el("footer-section", {
        brandName: "Studio",
        description: "A focused design studio crafting digital products with clarity and purpose.",
        copyrightText: "© 2026 Studio. All rights reserved.",
        link1Text: "Work", link1Href: "#work",
        link2Text: "Services", link2Href: "#services",
        link3Text: "Contact", link3Href: "#contact",
        link4Text: "Twitter", link4Href: "https://twitter.com",
        theme: "light",
      }, { padding: "60px 0", backgroundColor: "#ffffff" }),
    ];
  }

  return [];
}

export const sitesRoute = new Hono<{ Variables: AuthVariables }>()
  .get("/", async (c) => {
    const sessionUser = c.get("user");
    if (!sessionUser) return c.json([]);

    if ((sessionUser as Record<string, unknown>).role === "admin") {
      const all = await db.select().from(sites);
      return c.json(all);
    }

    const rows = await db
      .select({ sites: sites })
      .from(siteMembers)
      .innerJoin(sites, eq(siteMembers.siteId, sites.id))
      .where(eq(siteMembers.userId, sessionUser.id));

    return c.json(rows.map((r) => r.sites));
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
      data: z.record(z.string(), z.unknown()).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const siteId = nanoid();
      const template = (body.data as Record<string, unknown> | undefined)?.template as string | undefined;

      const [existing] = await db.select().from(sites).where(eq(sites.slug, body.slug)).limit(1);
      if (existing) {
        return c.json({ error: `A site with slug "${body.slug}" already exists` }, 409);
      }

      const [row] = await db.insert(sites).values({
        id: siteId,
        slug: body.slug,
        data: (body.data ?? { name: body.slug }) as SiteData,
      }).returning();

      if (template && template !== "blank") {
        const pageId = nanoid();
        const content = generateTemplateContent(template);
        await db.insert(pages).values({
          id: pageId,
          siteId,
          slug: "home",
          data: { title: "Home", path: "/", status: "published" },
          content: content as PageContent[],
          pubContent: content as PageContent[],
        });
      }

      const sessionUser = c.get("user");
      if (sessionUser?.id) {
        await db.insert(siteMembers).values({
          id: nanoid(),
          siteId,
          userId: sessionUser.id,
        });
      }

      return c.json(row, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      slug: z.string().min(1).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    })),
    async (c) => {
      const body = c.req.valid("json");
      const row = await updateById(sites, c.req.param("id"), {
        slug: body.slug,
        data: body.data as SiteData | undefined,
      });
      if (!row) return c.json({ error: "Not found" }, 404);
      return c.json(row);
    }
  )
  .delete("/:id", async (c) => {
    const row = await deleteById(sites, c.req.param("id"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true });
  });
