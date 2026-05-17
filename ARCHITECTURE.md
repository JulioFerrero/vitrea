# Hi Editor — Architecture & Philosophy

## Philosophy

Hi Editor is a self-hosted, open-source visual website builder. It is inspired by [Sanity CMS](https://www.sanity.io/) in its separation of concerns: the editing tool and the rendering library are completely independent.

**Core principles:**

1. **Separation of concerns** — The editor is a tool. The renderer is a library. They are independent packages that connect through a shared schema and database.

2. **Developer owns the components** — Hi does NOT provide pre-built UI sections (hero, nav, footer, etc.). Developers create their own React components and use Hi's schema system to connect them to the editor. Pre-built sections are available as examples or an optional presets package.

3. **Framework-agnostic rendering** — The rendering library (`@hi/render`) works with any React-based framework: Next.js, Fresh (Deno), Waku, plain React+Vite, Remix, etc. It has zero framework dependencies.

4. **React-first packages** — All packages use React APIs. Preact apps use `preact/compat` (alias at the app level, not in the packages). Next.js apps work natively.

5. **Minimal setup** — A developer should be able to go from `deno add @hi/editor` to a running editor with one config file and one command.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer's Project                      │
│                                                              │
│   hi.config.ts                                               │
│   ├── schema (element types, fields, styles)                 │
│   └── renderer (element type → React component mapping)      │
│                                                              │
│   components/                                                │
│   ├── hero-section.tsx    (developer's own React component)  │
│   ├── nav-bar.tsx                                            │
│   └── pricing-card.tsx                                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│       @hi/editor         │    │        @hi/render            │
│   (the editing tool)     │    │   (the rendering library)    │
│                          │    │                              │
│  - Visual SPA editor     │    │  - RenderPage component      │
│  - API server (Hono)     │    │  - ElementRenderer           │
│  - defineConfig()        │    │  - withStyles() HOC          │
│  - Schema builders       │    │  - buildTree()               │
│  - Field types           │    │  - classesFromStyles()       │
│  - Style groups          │    │  - generatePageCSS()         │
│  - Dashboard             │    │  - ElementProps type         │
│  - Built-in atoms        │    │  - Framework-agnostic       │
│    (section, heading,    │    │                              │
│     text, image...)      │    │  ZERO pre-built components   │
└───────────┬──────────────┘    └──────────────┬───────────────┘
            │                                  │
            ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                       @hi/database                           │
│                                                              │
│  - Drizzle ORM schema (sites, pages, elements, files)        │
│  - PostgreSQL client                                         │
│  - Migration utilities                                       │
│  - JSONB storage for element data and styles                 │
└──────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│                        @hi/cli                               │
│                                                              │
│  hi dev          Start editor with HMR (Vite dev server)     │
│  hi build        Build editor SPA for production             │
│  hi start        Start production editor server              │
│  hi db:init      Create database, run migrations, seed       │
│  hi db:migrate   Run Drizzle migrations                      │
│  hi db:seed      Seed the database                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Package Map

### `@hi/editor` — The Editing Tool

The visual page editor. Provides schema builders to define what can be edited, the editor SPA for visual editing, and a server for API + static asset serving.

**Exports:**

```ts
// Configuration
export { defineConfig } from "./config";

// Schema builders
export { defineElement, defineContainer, defineText, defineMedia, defineAction, defineUtility } from "./builders/elements";
export { textField, textareaField, selectField, urlField, numberField, createField } from "./builders/fields";
export { defineStyleGroup, styleField } from "./builders/styles";

// Built-in style groups
export { spacingStyles, sizingStyles, typographyStyles, backgroundStyles, layoutStyles, borderStyles, effectsStyles } from "./presets";

// Built-in atoms (basic element types)
export { sectionElement, rowElement, columnElement, gridElement, headingElement, textElement, imageElement, buttonElement, linkElement, dividerElement, spacerElement, videoElement, htmlElement } from "./atoms";

// Editor UI components (for the SPA)
export { Editor, Dashboard } from "./components";
export { createApiFetch } from "./lib/api";

// Icon registry
export { getIcon, hasIcon } from "./icons";

// Types
export type { EditorSchema, EditorConfig, ElementTypeConfig, FieldConfig, StyleGroupConfig, EditorApi, RendererAdapter } from "./types";
```

**Subpath exports:**
- `@hi/editor/api` — Hono API app (sites, pages, elements, files CRUD)
- `@hi/editor/server` — `createServer()` production server factory
- `@hi/editor/styles.css` — editor CSS

**Contains:**
- Editor SPA (Preact/React components for visual editing)
- Hono API server (CRUD for sites, pages, elements, files)
- Schema builders (defineElement, fields, styles)
- Built-in atoms (section, heading, text, image, button, etc.)
- `defineConfig()` for configuration
- `createServer()` for production serving
- Internal Vite config factory (for `hi dev` with HMR)

**Does NOT contain:**
- Pre-built section components (hero, nav, footer, etc.)
- Website rendering logic (that's `@hi/render`)
- Framework-specific code

### `@hi/render` — The Rendering Library

Connects DB/JSONB data to React components. Works with any React-based framework. Provides tree building, style mapping, and CSS generation.

**Exports:**

```ts
// Core rendering
export { RenderPage, ElementRenderer } from "./renderer";
export { buildTree } from "./tree";
export { withStyles, classesFromStyles, inlineStylesFromTokens } from "./styles";

// CSS generation
export { createTailwindGenerator } from "./tailwind";

// Server (optional convenience for Deno)
export { createWebsiteServer, defineSiteConfig } from "./server";

// Types
export type { RenderElement, ElementProps, RendererMap, SiteConfig } from "./types";
```

**Contains:**
- `RenderPage` — React component that renders a page from flat element data
- `ElementRenderer` — renders a single element with style application
- `withStyles()` — HOC that applies editor style tokens as Tailwind classes
- `buildTree()` — converts flat elements to nested tree
- `classesFromStyles()` — converts style tokens to CSS class strings
- CSS generation utilities
- `createWebsiteServer()` — optional convenience Hono server for Deno users
- Framework integration helpers

**Does NOT contain:**
- Any pre-built UI components
- Any editor code
- Any framework-specific code (works with all React frameworks)

### `@hi/database` — The Data Layer

Framework-agnostic database layer using Drizzle ORM and PostgreSQL.

**Exports:**

```ts
export { db } from "./client";
export { sites, pages, elements, files } from "./schema";
// Types, relations, migration utilities
```

### `@hi/cli` — The CLI

Thin command-line interface that reads config files and delegates to `@hi/editor` and `@hi/database`.

**Commands:**
- `hi dev` — starts editor with Vite HMR + API
- `hi build` — builds editor SPA
- `hi start` — starts production server
- `hi db:init` — creates DB, runs migrations, seeds
- `hi db:migrate` — runs Drizzle migrations
- `hi db:seed` — seeds the database

**Contains:**
- Vite config factory (all aliases, plugins — hidden from developer)
- SPA entry templates (generated dynamically from config)
- Database operation delegates

---

## Data Flow

### Editing Flow

```
1. Developer defines schema in hi.config.ts
2. hi dev starts → reads schema
3. Editor SPA loads → fetches schema from /api/config
4. Developer clicks "Add Element" → editor shows element types from schema
5. Developer fills fields → editor saves to DB via API
6. Editor canvas shows preview using @hi/render + developer's components
```

### Rendering Flow

```
1. User visits website URL
2. Website app fetches page elements from DB (via @hi/database or API)
3. RenderPage receives flat elements + renderer map
4. buildTree() converts flat → tree
5. ElementRenderer traverses tree, looks up component in renderer map
6. withStyles() applies style tokens as Tailwind classes
7. generatePageCSS() generates minimal Tailwind CSS for the page
8. Final HTML is served to the user
```

---

## Developer Experience

### Setting up the editor

```bash
deno add @hi/editor @hi/database @hi/cli
```

```ts
// hi.config.ts
import { defineConfig, defineElement, textField, spacingStyles } from "@hi/editor";
import { HeroSection } from "./components/hero-section";

const hero = defineElement({
  type: "hero-section",
  label: "Hero",
  category: "section",
  fields: [
    textField("headline", { label: "Headline", default: "Welcome" }),
    textField("subheadline", { label: "Sub-headline" }),
    textField("ctaText", { label: "Button Text", default: "Get Started" }),
  ],
  styleGroups: [spacingStyles],
});

export default defineConfig({
  database: { url: Deno.env.get("DATABASE_URL")! },
  schema: { elementTypes: [hero] },
  renderer: { "hero-section": HeroSection },
});
```

```jsonc
// deno.json
{
  "tasks": {
    "dev": "deno run -A --env @hi/cli dev",
    "build": "deno run -A --env @hi/cli build",
    "start": "deno run -A --env @hi/cli start",
    "db:init": "deno run -A --env @hi/cli db:init"
  }
}
```

```bash
deno task db:init
deno task dev
```

### Using the renderer in Next.js

```bash
npm install @hi/render @hi/database
```

```tsx
// app/[[...slug]]/page.tsx
import { RenderPage } from "@hi/render";
import { db, pages, elements } from "@hi/database";
import { eq, asc } from "drizzle-orm";

export default async function Page({ params }) {
  const slug = "/" + (params.slug?.join("/") ?? "");
  const allPages = await db.select().from(pages).where(eq(pages.siteId, process.env.SITE_ID!));
  const page = allPages.find(p => p.data.path === slug);
  if (!page) return <div>Not found</div>;

  const els = await db.select().from(elements).where(eq(elements.pageId, page.id)).orderBy(asc(elements.order));

  return (
    <RenderPage
      elements={els}
      renderer={{
        "hero-section": HeroSection,
        "nav-bar": NavBar,
        "footer-section": Footer,
      }}
    />
  );
}
```

### Using the renderer in Fresh (Deno)

```tsx
// routes/[[slug]].tsx
import { RenderPage } from "@hi/render";
import { db, pages, elements } from "@hi/database";
// same pattern — fetch from DB, render with RenderPage
```

### Using the renderer in any React app

```tsx
import { RenderPage, buildTree, classesFromStyles } from "@hi/render";
// same API everywhere — it's just React
```

---

## Component Contract

Developer components receive a standard set of props from `@hi/render`:

```tsx
import type { ElementProps } from "@hi/render";

interface ElementProps {
  data: Record<string, unknown>;   // field values from the editor
  styles: Record<string, string>;  // style tokens from the editor
  className: string;               // computed Tailwind classes (via withStyles)
  style: React.CSSProperties;      // inline styles for hex colors, etc.
  children?: React.ReactNode;      // child elements (for containers)
  editor?: boolean;                // true when rendering in editor canvas
}
```

**Example component:**

```tsx
import type { ElementProps } from "@hi/render";

export function HeroSection({ data, className, children }: ElementProps) {
  return (
    <section className={className}>
      <h1>{data.headline as string}</h1>
      <p>{data.subheadline as string}</p>
      <a href={data.ctaHref as string}>{data.ctaText as string}</a>
    </section>
  );
}
```

Or with `withStyles` for automatic style handling:

```tsx
import { withStyles, type ElementProps } from "@hi/render";

export const HeroSection = withStyles(function HeroSection({ data, className }: ElementProps) {
  return (
    <section className={className}>
      <h1>{data.headline as string}</h1>
      <p>{data.subheadline as string}</p>
    </section>
  );
});
```

---

## Icon Handling

Icons in schema definitions use **string names**, not React components. The editor has a built-in icon registry.

```ts
defineElement({
  type: "hero-section",
  label: "Hero",
  icon: "layout-template",  // string name, not a component
  // ...
});
```

The editor maps icon names to Lucide icons internally. This keeps the schema serializable and framework-agnostic.

---

## Style System

Styles are stored as simple string-token maps in JSONB:

```json
{
  "padding": "8",
  "paddingX": "6",
  "backgroundColor": "cherry-600",
  "fontSize": "5xl",
  "fontWeight": "bold"
}
```

`@hi/render` converts these to Tailwind classes:

```ts
import { classesFromStyles } from "@hi/render";

classesFromStyles({ padding: "8", backgroundColor: "cherry-600" })
// → "p-8 bg-cherry-600"
```

Hex colors are handled as inline styles (Tailwind can't generate classes for arbitrary hex at build time).

---

## Migration Status

### Phase 1: Foundation ✅ DONE
1. Kill lucide barrel files — use named imports + Vite alias
2. Create `@hi/render` from `@hi/website` rendering infrastructure
3. Absorb `@hi/api` into `@hi/editor` (routes at `packages/editor/src/api/`)
4. Delete `@hi/cms` (was unused)
5. Delete `@hi/types` (zero imports, types come from `@hi/render` + `@hi/database`)
6. Delete `@hi/api` (absorbed into `@hi/editor/src/api/`)
7. Clean `@hi/website` — removed `@hi/database`, `@hi/types`, `@hi/utils`, `lucide-react`, `react-dom` deps

### Phase 2: Server & Config ✅ DONE
- `defineConfig()` in `@hi/editor`
- `createServer()` in `@hi/editor/server` (separate export to avoid browser bundle pollution)
- `withStyles()` HOC in `@hi/render`
- `createWebsiteServer()` + `defineSiteConfig()` in `@hi/render`
- Icons changed from React components to string names throughout
- Built-in atoms (13) added to `@hi/editor/src/atoms/`
- Built-in style presets (7) added to `@hi/editor/src/presets/`
- Icon registry (`getIcon`, `hasIcon`) in `@hi/editor/src/icons.ts`

### Phase 3: CLI ✅ DONE
- `@hi/cli` created with `dev`, `build`, `start`, `db:init`, `db:migrate`, `db:seed`, `db:push`, `db:generate`

### Phase 4: Apps (partial)
- `apps/editor` — still has its own `vite.config.ts` + `src/` (will be simplified when CLI generates Vite config)
- `apps/web` — uses Fresh 2.x + `@hi/website` + `@hi/render` (Fresh stays by design)
- Pre-built sections remain in `@hi/website/src/components/` (serves as example)

### Phase 5: Cleanup ✅ DONE
- `@hi/api`, `@hi/cms`, `@hi/types` deleted
- `@hi/utils` kept (used by `@hi/ui` and `@hi/editor`)
- Current packages: `@hi/editor`, `@hi/render`, `@hi/database`, `@hi/ui`, `@hi/utils`, `@hi/website` (example), `@hi/cli`, `@hi/config-tsconfig`

---

## Package Dependency Graph

```
@hi/database      ← (leaf: drizzle-orm, postgres)
@hi/utils         ← (leaf: clsx, tailwind-merge)
@hi/ui            ← @hi/utils (Radix-based React UI components)
@hi/render        ← hono (leaf: React + hono for convenience server)
@hi/editor        ← @hi/utils, @hi/ui, @hi/database, @hi/render, lucide-react
@hi/cli           ← @hi/editor, @hi/database, @hi/website (thin wrapper)
@hi/website       ← @hi/editor, @hi/render (example: pre-built components + schema)
```

Note: `@hi/render` has NO dependency on `@hi/editor`. A website that only renders pages never needs the editor package.

---

## Comparison with Sanity CMS

| Concept | Sanity | Hi Editor |
|---------|--------|-----------|
| Schema definition | `defineType()`, `defineField()` | `defineElement()`, `textField()`, etc. |
| Editor tool | Studio (visual) | Editor SPA (visual) |
| Content storage | Content Lake (hosted) | PostgreSQL JSONB (self-hosted) |
| Rendering | Developer's responsibility | `@hi/render` (optional helpers) |
| Framework | React-based Studio | React-based Editor |
| Query language | GROQ | Direct SQL (Drizzle) |
| Plugin system | `definePlugin()` | Planned for future |
| CLI | `sanity dev/build/deploy` | `hi dev/build/start` |
| Config file | `sanity.config.ts` | `hi.config.ts` |
| Pre-built components | None (developer builds) | None (developer builds) |

The key similarity: **schema and rendering are completely separate**. The schema tells the editor what to show. The renderer tells the website what to render. The developer controls both.
