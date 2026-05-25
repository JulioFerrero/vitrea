import { eq } from "drizzle-orm";

async function main() {
  const { db } = await import("./client");
  const { sites, pages, elements, collections, documents } = await import("./schema");
  const { nanoid } = await import("nanoid");

  const existing = await db.select().from(sites);
  if (existing.length > 0) {
    const siteId = existing[0]!.id;
    console.log("Database already seeded. Truncate first if you want to re-seed.");
    console.log(`SITE_ID=${siteId}`);

    const cmsExisting = await db.select().from(documents);
    if (cmsExisting.length < 4) {
      console.log("\nSeeding CMS content...");
      await seedCmsContent(db, siteId, collections, documents, nanoid, eq);
    }

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
  console.log("\nSeeding CMS content...");
  await seedCmsContent(db, siteId, collections, documents, nanoid, eq);

  console.log("\nAdd SITE_ID to your .env files.");
  Deno.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  Deno.exit(1);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedCmsContent(db: any, siteId: string, collections: any, documents: any, nanoid: () => string, eq: any) {
  const cols = await db.select().from(collections).where(eq(collections.siteId, siteId));

  if (cols.length === 0) {
    // Seed collections from config-like data
    const collectionDefs = [
      { name: "product", label: "Product", icon: "package", fields: [
        { name: "name", label: "Product Name", type: "text", required: true },
        { name: "subtitle", label: "Subtitle", type: "text" },
        { name: "price", label: "Price", type: "text" },
        { name: "ctaText", label: "CTA Text", type: "text", default: "Buy Now" },
        { name: "ctaUrl", label: "CTA URL", type: "url" },
        { name: "image", label: "Product Image", type: "image" },
        { name: "category", label: "Category", type: "select", options: ["shoes", "hats", "tshirts", "accessories"] },
      ]},
      { name: "post", label: "Blog Post", icon: "file-text", fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text" },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
        { name: "body", label: "Body", type: "textarea" },
        { name: "coverImage", label: "Cover Image", type: "image" },
        { name: "author", label: "Author", type: "text" },
      ]},
      { name: "faq", label: "FAQ", icon: "help-circle", fields: [
        { name: "title", label: "Title", type: "text" },
        { name: "questions", label: "Questions", type: "array", preview: "question", of: [
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ]},
      ]},
    ];

    for (const def of collectionDefs) {
      await db.insert(collections).values({
        id: nanoid(),
        siteId,
        name: def.name,
        label: def.label,
        icon: def.icon,
        fields: def.fields,
      });
    }

    const updated = await db.select().from(collections).where(eq(collections.siteId, siteId));
    cols.push(...updated.slice(-collectionDefs.length));
  }

  const colMap: Record<string, string> = {};
  for (const c of cols) colMap[c.name] = c.id;

  // Sample products
  const products = [
    { name: "Air Max Runner", subtitle: "Lightweight daily trainer", price: "$129.99", ctaText: "Shop Now", ctaUrl: "/products/air-max", image: "", category: "shoes" },
    { name: "Cloud Strider Pro", subtitle: "Maximum cushion for long runs", price: "$159.99", ctaText: "Shop Now", ctaUrl: "/products/cloud-strider", image: "", category: "shoes" },
    { name: "Trail Blazer X", subtitle: "All-terrain grip", price: "$139.99", ctaText: "Shop Now", ctaUrl: "/products/trail-blazer", image: "", category: "shoes" },
    { name: "Classic Snapback", subtitle: "Timeless curved brim", price: "$34.99", ctaText: "Shop Now", ctaUrl: "/products/snapback", image: "", category: "hats" },
    { name: "Performance Cap", subtitle: "Moisture-wicking, breathable", price: "$29.99", ctaText: "Shop Now", ctaUrl: "/products/perf-cap", image: "", category: "hats" },
    { name: "Essential Tee", subtitle: "Premium cotton, relaxed fit", price: "$39.99", ctaText: "Shop Now", ctaUrl: "/products/essential-tee", image: "", category: "tshirts" },
    { name: "Graphic Print Tee", subtitle: "Limited edition design", price: "$44.99", ctaText: "Shop Now", ctaUrl: "/products/graphic-tee", image: "", category: "tshirts" },
    { name: "Canvas Tote Bag", subtitle: "Durable everyday carry", price: "$49.99", ctaText: "Shop Now", ctaUrl: "/products/tote", image: "", category: "accessories" },
  ];

  if (colMap["product"]) {
    for (const p of products) {
      await db.insert(documents).values({
        id: nanoid(),
        collectionId: colMap["product"],
        siteId,
        data: p,
        status: "published",
      });
    }
    console.log(`  Seeded ${products.length} products`);
  }

  // Sample blog posts
  const posts = [
    { title: "Introducing Hi Editor CMS", slug: "introducing-cms", excerpt: "We shipped a fully-featured CMS with collections, array fields, and a structure builder.", body: "Today we're excited to announce the CMS layer for Hi Editor...", coverImage: "", author: "Team Hi Editor" },
    { title: "Building with Structure Navigation", slug: "structure-navigation", excerpt: "Learn how to define custom CMS hierarchies using the Structure Builder API.", body: "The Structure Builder lets you create multi-column navigation...", coverImage: "", author: "Julio" },
    { title: "Why Self-Hosted CMS Matters", slug: "self-hosted-cms", excerpt: "Owning your content infrastructure means no vendor lock-in and full control.", body: "In an era of SaaS platforms, self-hosting has become radical again...", coverImage: "", author: "Team Hi Editor" },
  ];

  if (colMap["post"]) {
    for (const p of posts) {
      await db.insert(documents).values({
        id: nanoid(),
        collectionId: colMap["post"],
        siteId,
        data: p,
        status: "published",
      });
    }
    console.log(`  Seeded ${posts.length} blog posts`);
  }

  // Sample FAQs
  const faqs = [
    { title: "General", questions: [{ question: "What is Hi Editor?", answer: "Hi Editor is a self-hosted, open-source visual website builder and CMS." }, { question: "Is it free?", answer: "Yes, completely free and open source under the MIT license." }] },
    { title: "Technical", questions: [{ question: "What database does it use?", answer: "PostgreSQL with JSONB columns for flexible content storage." }, { question: "Can I extend it?", answer: "Yes, you can create custom element types, field types, and style groups." }] },
  ];

  if (colMap["faq"]) {
    for (const f of faqs) {
      await db.insert(documents).values({
        id: nanoid(),
        collectionId: colMap["faq"],
        siteId,
        data: f,
        status: "published",
      });
    }
    console.log(`  Seeded ${faqs.length} FAQs`);
  }

  console.log("CMS content seeded.");
}
