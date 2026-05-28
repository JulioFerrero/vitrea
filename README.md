# Hi Editor

A self-hosted, open-source visual website builder. Design pages with a drag-and-drop editor, store content in PostgreSQL, and render sites with Deno.

## Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   Editor (port 5173)      │         │   Website (port 8000)     │
│                            │         │                            │
│  ┌──────┬──────┬───────┐  │         │   Page renderer            │
│  │Left  │Canvas│Right  │  │         │   /[...slug]               │
│  │Panel │      │Panel  │  │         │                            │
│  │pages │  tld │props  │  │         │   Renders components       │
│  │layers│ raw  │edit   │  │         │   from Postgres JSONB      │
│  └──────┴──────┴───────┘  │         │                            │
│           │                │         │           │                │
└───────────┼────────────────┘         └───────────┼────────────────┘
            │                                      │
            ▼                                      ▼
        ┌──────────────────────────────────────────┐
        │          Hono REST API                    │
        │   /api/sites, /pages, /elements            │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   PostgreSQL      │
                 │   (JSONB props)   │
                 └──────────────────┘
```

### Monorepo Structure

```
web-builder/
├── apps/
│   ├── web/              Fresh/Preact — renders published websites
│   └── editor/           Vite/Preact SPA + Deno Hono server — visual builder
├── packages/
│   ├── utils/            cn(), slugify(), buildPath()
│   ├── ui/               Base UI components (17 components, Radix-based)
│   ├── database/         Drizzle ORM schema, migrations, seed
│   ├── render/           Element renderer, tree utilities
│   ├── auth/             Better Auth integration, middleware
│   ├── cms/              Collection schema builder, field types
│   ├── editor/           Element definitions, style presets, API routes
│   ├── website/          Component registry, page renderer, built-in sections
│   └── create/           Project scaffolder CLI
├── deploy/               Docker, Coolify, and nixpacks configs
└── docker/               Legacy Docker configs
```

### Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Deno 2 |
| UI | Preact + React compat |
| Database | PostgreSQL 16 + Drizzle ORM |
| API | Hono |
| Auth | Better Auth |
| State | Zustand |
| Validation | Zod |
| Styling | Tailwind CSS v4 |
| Build | Vite |
| Publish | JSR |

### How it works

1. **Element Registry** — Each UI element (Hero, Features, CTA, Footer, etc.) registers itself with a schema defining its props. The registry lives in `@hi/editor`.

2. **Postgres JSONB Storage** — Every element instance on a page is stored with props, styles, and layout as JSONB. This gives structured content without a third-party CMS.

3. **Page Rendering** — The website app resolves the URL path, fetches the page and its ordered elements from Postgres, and renders the Preact component.

4. **Visual Editor** — A drag-and-drop canvas with live previews, a property panel that auto-generates forms from element schemas, real-time collaboration cursors, and CMS collection management.

5. **CMS Collections** — Define collections (Blog Posts, Products, etc.) with typed schemas, then bind components to collection items for dynamic data.

## Quick Start

### Prerequisites

- [Deno](https://deno.land) 2+
- Docker (for PostgreSQL)

### Setup

```bash
git clone <repo-url> web-builder
cd web-builder

# Start PostgreSQL
deno task docker:up

# Wait for Postgres, then apply schema
deno task db:push

# Seed with sample data
deno task db:seed
```

The seed script outputs a `WEBSITE_ID`. Add it to your `.env`:

```
WEBSITE_ID=<paste-id-here>
```

### Run

```bash
# Both apps
deno task dev

# Or individually
deno task dev:editor    # → http://localhost:5173
deno task dev:web       # → http://localhost:8000
```

### Commands

| Command | Description |
|---|---|
| `deno task dev` | Start both apps in dev mode |
| `deno task dev:editor` | Editor only |
| `deno task dev:web` | Website renderer only |
| `deno task build` | Production build for both apps |
| `deno task check` | TypeScript check |
| `deno task lint` | Lint all packages |
| `deno task docker:up` | Start Postgres container |
| `deno task docker:down` | Stop Postgres container |
| `deno task db:push` | Push schema to database |
| `deno task db:generate` | Generate migration from schema changes |
| `deno task db:seed` | Seed database with sample data |

## Packages on JSR

All packages are published to [JSR](https://jsr.io):

| Package | Description |
|---------|-------------|
| `@hi/utils` | Utility functions (clsx, tailwind-merge wrappers) |
| `@hi/ui` | UI component library (Button, Dialog, Card, etc.) |
| `@hi/database` | Drizzle ORM schema, client, migrations |
| `@hi/render` | Element renderer, tree utilities |
| `@hi/auth` | Authentication (Better Auth) + middleware |
| `@hi/cms` | CMS collection schema builder |
| `@hi/editor` | Element definitions, style presets, API routes, server |
| `@hi/website` | Component registry, built-in sections, Tailwind CSS generator |
| `@hi/create` | Project scaffolder CLI |

Install any package:

```bash
deno add @hi/editor
```

## Self-Hosting

See [deploy/README.md](deploy/README.md) for full deployment docs.

### Docker Compose (recommended)

```bash
cd deploy
cp ../.env.example .env
# Edit .env — set BETTER_AUTH_SECRET and BETTER_AUTH_URL

docker compose up -d

# Initialize database
docker compose exec editor deno task db:push
docker compose exec editor deno task db:seed
```

### Coolify

Use `deploy/docker-compose.coolify.yml` as the compose template in Coolify. Set `SERVICE_FQDN_EDITOR` to your domain.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random secret for auth |
| `BETTER_AUTH_URL` | Yes | Public editor URL |
| `WEBSITE_ID` | For web app | Which website to render |
| `S3_ENDPOINT` | No | S3 storage endpoint |
| `S3_ACCESS_KEY` | No | S3 credentials |
| `S3_SECRET_KEY` | No | S3 credentials |
| `S3_BUCKET` | No | S3 bucket name |

## Creating Custom Elements

1. Define an element:

```ts
import { defineElement } from "@hi/editor";

export const myElement = defineElement({
  type: "my-element",
  name: "My Element",
  category: "section",
  fields: {
    title: textField("Title"),
    subtitle: textField("Subtitle"),
  },
  defaultProps: { title: "Hello", subtitle: "" },
  render: (props) => `<section><h1>${props.title}</h1></section>`,
});
```

2. Register it in your config — it automatically appears in the editor's element picker and the page renderer.

## License

MIT
