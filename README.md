# Vitrea

> Open-source website builder with a reusable editor core, project-owned schema packages, and a live website app.

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.11-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/web-Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vite](https://img.shields.io/badge/editor-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Vitrea is a monorepo for building and running:

- a visual editor app
- a website app
- reusable platform packages
- project-specific schema and renderer packages

The core idea is simple:

- `packages/*` contains the reusable Vitrea platform
- `internal/*` contains the site-specific implementation
- `apps/*` assembles and runs the system

## Why Vitrea

- **Thin apps**: the editor and website apps stay small and mostly compose existing packages
- **Reusable core**: `@vitrea/editor`, `@vitrea/render`, `@vitrea/database`, and related packages hold the platform logic
- **Project-owned schema**: `internal/editor` defines the content model for a specific site
- **Project-owned rendering**: `internal/web` defines how those elements render in the editor preview and website
- **Modern stack**: Node.js, `pnpm`, Next.js, Vite, React, Drizzle, Hono, and Tailwind

## Workspace Overview

```text
vitrea/
  apps/
    editor/      # Vite + React editor app
    web/         # Next.js website app
  internal/
    editor/      # Project-specific schemas and CMS structure
    web/         # Project-specific frontend components and renderer
  packages/
    auth/
    cms/
    create/
    database/
    editor/
    editor-ui/
    render/
    ui/
    utils/
  deploy/
  scripts/
```

## How It Works

### Editor Flow

- `apps/editor` mounts `EditorApp` from `@vitrea/editor`
- `@internal/editor` provides the schema
- `@internal/web` provides the renderer adapter used for previewing content
- the Vite dev server also mounts the editor API and collaboration WebSocket bridge during local development

### Website Flow

- `apps/web` loads a configured site ID from environment
- it reads page records from `@vitrea/database`
- it renders `pages.pubContent`, or `pages.content` as a fallback
- `PageRenderer` from `@internal/web` maps page elements to React components

### Data Flow

- pages are stored in the `pages` table
- `pages.data` stores metadata such as path and title
- `pages.content` stores the draft tree
- `pages.pubContent` stores the published tree

## Getting Started

### Requirements

- Node.js `>= 20.11`
- `pnpm`
- Docker

### Local Setup

```bash
pnpm install
docker compose up -d
pnpm db:push
pnpm dev
```

This starts:

- the editor at [http://localhost:3001](http://localhost:3001)
- the website at [http://localhost:3000](http://localhost:3000)

## Environment

Vitrea uses a repo-root `.env` shared by both apps.

Common values include:

- `DATABASE_URL`
- `SITE_ID`
- `BETTER_AUTH_URL`
- storage configuration for S3-compatible file handling

Both app configs load the root `.env` before importing workspace packages that require environment variables at module evaluation time.

## Scripts

### Root

- `pnpm dev` runs the editor and website together
- `pnpm dev:editor` runs the editor app
- `pnpm dev:web` runs the website app
- `pnpm build` builds both apps
- `pnpm build:editor` builds the editor app
- `pnpm build:web` builds the website app
- `pnpm db:push` pushes the Drizzle schema
- `pnpm dev:create` runs the scaffolder package
- `pnpm build:create` builds the scaffolder package

## Package Boundaries

### `packages/*`

Reusable platform code lives here.

Important packages:

- `@vitrea/editor`: generic editor framework and API surface
- `@vitrea/render`: render tree utilities and renderer primitives
- `@vitrea/database`: database schema and DB client
- `@vitrea/cms`: CMS fields and structure helpers
- `@vitrea/auth`: auth integration
- `@vitrea/editor-ui`: editor-specific UI primitives
- `@vitrea/ui`: shared UI components
- `@vitrea/create`: scaffolding and templates

### `internal/*`

Project-owned code lives here.

- `@internal/editor`: schemas, content definitions, CMS structure
- `@internal/web`: frontend component registry, page renderer, and website renderer adapter

This keeps the reusable framework separate from the implementation of a specific site.

## Dev Notes

- Workspace packages in `packages/*` build to `dist`
- `dist` is build output, not source
- server-only helpers use explicit subpaths so browser code does not pull in Node-only modules
- internal packages export source directly and are used as project-level composition layers

## Documentation

- Architecture overview: [VITREA_PROJECT_STRUCTURE.md](./VITREA_PROJECT_STRUCTURE.md)

## Contributing

Vitrea is structured to make platform work and project work easy to reason about.

If you are contributing:

- put reusable behavior in `packages/*`
- put site-specific schema and rendering code in `internal/*`
- keep apps thin
- avoid mixing browser-safe and server-only exports in the same entrypoint

## License

MIT
