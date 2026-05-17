async function main() {
  const { db } = await import("./client");
  const { sites, pages, elements } = await import("./schema");
  const { nanoid } = await import("nanoid");

  const existing = await db.select().from(sites);
  if (existing.length > 0) {
    console.log("Database already seeded. Truncate first if you want to re-seed.");
    console.log(`SITE_ID=${existing[0]!.id}`);
    Deno.exit(0);
  }

  console.log("Seeding Hi Editor landing page...");

  const siteId = nanoid();
  await db.insert(sites).values({
    id: siteId,
    slug: "hi-editor",
    data: {
      name: "Hi Editor",
      domain: "localhost:3000",
      settings: {
        primaryColor: "#e11d48",
        fontFamily: "Recursive",
        description: "The self-hosted visual website builder",
      },
    },
  });

  const homeId = nanoid();
  const aboutId = nanoid();

  await db.insert(pages).values([
    { id: homeId, siteId, slug: "", data: { title: "Hi Editor — Visual Website Builder", path: "/", status: "published" } },
  ]);
  await db.insert(pages).values([
    { id: aboutId, siteId, slug: "about", data: { title: "About", path: "/about", status: "published", parentId: homeId } },
  ]);

  // ── HOME PAGE: Hi Editor Landing ──
  await db.insert(elements).values([

    // Nav Bar
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "nav-bar", order: 0,
      data: {
        brandName: "Hi Editor",
        link1Text: "Features",
        link1Href: "#features",
        link2Text: "Docs",
        link2Href: "/docs",
        ctaText: "Open Editor",
        ctaHref: "/editor",
      },
      styles: {},
    },

    // Hero Section
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "hero-section", order: 1,
      data: {
        badge: "Self-hosted visual builder",
        headline: "Your pages.\nYour server.",
        subheadline: "Build landing pages with atomic elements. Store everything in PostgreSQL. Render anywhere. No vendor lock-in.",
        ctaText: "Start Building",
        ctaHref: "#",
        secondaryCtaText: "Read the Docs",
        secondaryCtaHref: "/docs",
      },
      styles: {},
    },

    // Features Section
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "features-section", order: 2,
      data: {
        headline: "Built for teams\nthat ship",
        subtitle: "Four pillars. Zero compromises.",
        features: [
          { title: "Visual Editor", description: "Drag, drop, configure. Atomic elements — headings, text, images, buttons, sections — composed into full pages." },
          { title: "Self-hosted", description: "PostgreSQL and JSONB. Your database, your server. No third-party CMS, no vendor lock-in, no surprises." },
          { title: "Developer SDK", description: "Type-safe element definitions. Custom field types. Style groups. Build your own components with zero config." },
          { title: "Open Source", description: "MIT licensed. Fork it, extend it, ship it. The full stack is yours to modify." },
        ],
      },
      styles: {},
    },

    // Showcase Section
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "showcase-section", order: 3,
      data: {
        headline: "Every element,\nunder control",
        description: "From typography to layout, every detail lives in structured JSON. Edit visually, render server-side, deploy anywhere.",
        ctaText: "See how it works",
        ctaHref: "/editor",
        imageSrc: "https://placehold.co/800x500/F5F0EB/9B8E82?text=Hi+Editor+Screenshot",
        imageAlt: "Hi Editor Interface",
        variant: "image-right",
      },
      styles: {},
    },

    // CTA Section
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "cta-section", order: 4,
      data: {
        headline: "Ship it.",
        description: "Start building pages with Hi Editor today. Free, open source, fully self-hosted.",
        ctaText: "Get Started",
        ctaHref: "#",
      },
      styles: {},
    },

    // Footer Section
    {
      id: nanoid(), pageId: homeId, parentId: null, type: "footer-section", order: 5,
      data: {
        brandName: "Hi Editor",
        description: "The self-hosted visual website builder.",
        copyrightText: "© 2026 Hi Editor. Open source under MIT.",
        link1Text: "GitHub",
        link1Href: "https://github.com",
        link2Text: "Docs",
        link2Href: "/docs",
        link3Text: "Twitter",
        link3Href: "https://twitter.com",
      },
      styles: {},
    },

  ]);

  // ── ABOUT PAGE (atomic elements) ──
  const aboutHero = nanoid();
  const aboutCol = nanoid();
  const aboutValuesSection = nanoid();
  const aboutValuesGrid = nanoid();

  await db.insert(elements).values([
    { id: aboutHero, pageId: aboutId, parentId: null, type: "section", order: 0, data: {}, styles: { width: "full", padding: "32", paddingX: "6" } },
    { id: aboutCol, pageId: aboutId, parentId: aboutHero, type: "column", order: 0, data: {}, styles: { display: "flex", flexDirection: "col", maxWidth: "3xl", margin: "auto", gap: "4" } },
    { id: nanoid(), pageId: aboutId, parentId: aboutCol, type: "heading", order: 0, data: { content: "About Hi Editor", tagName: "h1" }, styles: { fontSize: "6xl", fontWeight: "bold", color: "#1c1917" } },
    { id: nanoid(), pageId: aboutId, parentId: aboutCol, type: "text", order: 1, data: { content: "We are building the future of self-hosted web publishing. Hi Editor gives you full control over your content, your design, and your data." }, styles: { fontSize: "lg", color: "#78716c", lineHeight: "relaxed" } },

    { id: aboutValuesSection, pageId: aboutId, parentId: null, type: "section", order: 1, data: {}, styles: { width: "full", padding: "20", paddingX: "6", backgroundColor: "#FFF5EB" } },
    { id: nanoid(), pageId: aboutId, parentId: aboutValuesSection, type: "heading", order: 0, data: { content: "Our Values", tagName: "h2" }, styles: { fontSize: "5xl", fontWeight: "bold", textAlign: "center", marginY: "12", color: "#1c1917" } },
    { id: aboutValuesGrid, pageId: aboutId, parentId: aboutValuesSection, type: "grid", order: 1, data: {}, styles: { display: "grid", gridTemplateColumns: "2", gap: "6", maxWidth: "5xl", margin: "auto" } },
    ...[
      { title: "Open Source", desc: "Everything we build is free and open source. No hidden costs, no lock-in." },
      { title: "Developer First", desc: "Type-safe APIs, instant feedback, great DX. Built by developers, for developers." },
      { title: "Performance", desc: "Fast rendering, minimal bundle, optimized for real-world usage." },
      { title: "Extensible", desc: "Create custom element types with zero config. Make it yours." },
    ].flatMap((v, i) => {
      const cardId = nanoid();
      return [
        { id: cardId, pageId: aboutId, parentId: aboutValuesGrid, type: "column", order: i, data: {}, styles: { display: "flex", flexDirection: "col", padding: "6", gap: "2", backgroundColor: "#ffffff", borderRadius: "lg" } },
        { id: nanoid(), pageId: aboutId, parentId: cardId, type: "heading", order: 0, data: { content: v.title, tagName: "h3" }, styles: { fontSize: "lg", fontWeight: "semibold", color: "#1c1917" } },
        { id: nanoid(), pageId: aboutId, parentId: cardId, type: "text", order: 1, data: { content: v.desc }, styles: { fontSize: "sm", color: "#78716c" } },
      ];
    }),

    // About Footer
    {
      id: nanoid(), pageId: aboutId, parentId: null, type: "footer-section", order: 2,
      data: {
        brandName: "Hi Editor",
        description: "The self-hosted visual website builder.",
        copyrightText: "© 2026 Hi Editor. Open source under MIT.",
        link1Text: "GitHub",
        link1Href: "https://github.com",
        link2Text: "Docs",
        link2Href: "/docs",
      },
      styles: {},
    },
  ].flat());

  console.log("\nDone!");
  console.log(`  SITE_ID=${siteId}`);
  console.log("  Pages: Home (/), About (/about)");
  console.log("  Home uses section components: nav-bar, hero-section, features-section, showcase-section, cta-section, footer-section");
  console.log("  About uses atomic elements: section, heading, text, grid, column, footer-section");
  console.log("\nAdd SITE_ID to your .env files.");
  Deno.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  Deno.exit(1);
});
