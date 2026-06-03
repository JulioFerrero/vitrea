# Vitrea Project Structure

This document describes how the Vitrea workspace is organized and how the main parts of the project work together.

## Workspace Layout

The monorepo is a `pnpm` workspace with three top-level groups:

- `apps/*`
- `internal/*`
- `packages/*`

The root workspace provides the main developer entrypoints:

- `pnpm dev:web`
- `pnpm dev:editor`
- `pnpm dev`
- `pnpm build:web`
- `pnpm build:editor`
- `pnpm db:push`

## Top-Level Responsibilities

### `apps/`

`apps/` contains runnable applications.

- `apps/editor`
  The editor application. It is a Vite + React SPA that mounts the generic editor framework from `@vitrea/editor` and passes project-specific schema and renderer adapters from the internal packages.

- `apps/web`
  The website application. It is a Next.js app that renders published page content for a configured site.

### `internal/`

`internal/` contains project-owned code that is specific to this repository. These packages are not the reusable platform packages. They are the place where a project defines its own content model and presentation layer.

- `internal/editor`
  The project’s editor schema package. It defines element schemas, content structure, and CMS structure for this specific site.

- `internal/web`
  The project’s website rendering package. It defines the React components used to render page elements and exposes the renderer adapter consumed by both the editor preview and the website app.

### `packages/`

`packages/` contains the reusable Vitrea platform packages and shared libraries.

Key packages include:

- `@vitrea/editor`
  The generic editor framework and API surface.

- `@vitrea/render`
  Render tree utilities, renderer primitives, and server-only Tailwind helpers exposed via explicit subpaths.

- `@vitrea/database`
  Drizzle schema and database client package.

- `@vitrea/cms`
  CMS structure and field builders.

- `@vitrea/auth`
  Authentication helpers and middleware.

- `@vitrea/editor-ui`
  Editor-specific UI components.

- `@vitrea/ui`
  General shared UI primitives.

- `@vitrea/utils`
  Shared utilities.

- `@vitrea/create`
  Project scaffolding package. Its templates mirror the current live repo structure.

## Application Composition

### Editor App

The editor app is intentionally thin.

`apps/editor/src/app.tsx` mounts:

- `EditorApp` from `@vitrea/editor`
- `schema` from `@internal/editor`
- `websiteRenderer` from `@internal/web`

This means:

- `@vitrea/editor` owns the editor product behavior
- `@internal/editor` defines what can be edited
- `@internal/web` defines how those elements render

The editor dev server lives in `apps/editor/vite.config.ts` and also hosts the editor API bridge during development.

That Vite config is responsible for:

- loading the repo-root `.env`
- mounting `@vitrea/editor/api`
- serving editor API requests through middleware
- hosting the WebSocket collaboration bridge
- importing `@internal/web/tailwind` for server-only Tailwind and iframe CSS work

### Website App

The website app is also intentionally thin.

`apps/web/src/app/[[...slug]]/page.tsx`:

- loads the site ID from environment
- queries `pages` from `@vitrea/database`
- matches the current route against `page.data.path`
- renders `page.pubContent` first, or `page.content` as a fallback
- passes the resulting tree into `PageRenderer` from `@internal/web`

`apps/web/next.config.ts` loads the repo-root `.env` before workspace packages are evaluated. This is important because `@vitrea/database` reads `DATABASE_URL` at module load time.

## Internal Package Boundaries

### `@internal/editor`

`@internal/editor` is the project’s schema package.

Its root entry exports:

- `schema`
- `elements`
- `content`
- `cmsStructure`

It also exposes a dedicated server-oriented subpath:

- `@internal/editor/references`

The purpose of this split is to keep the root entry safe for browser imports while allowing server-only reference resolution logic to stay available where needed.

### `@internal/web`

`@internal/web` is the project’s rendering package.

Its root entry exports browser-safe rendering pieces:

- `PageRenderer`
- `websiteRenderer`
- component registry helpers
- renderer types

It also exposes a dedicated server-only subpath:

- `@internal/web/tailwind`

That subpath owns:

- Tailwind CSS generation
- iframe base CSS generation
- absolute font URL preparation

This separation keeps Node-only functionality out of the client module graph.

## Platform Package Boundaries

### `@vitrea/editor`

`@vitrea/editor` is built to `dist` and exposes multiple entrypoints:

- `@vitrea/editor`
- `@vitrea/editor/api`
- `@vitrea/editor/server`

It contains:

- the editor SPA shell
- dashboard, account, assets, CMS, settings, and user views
- editor state and actions
- API routes
- editor server helpers

The editor package is intentionally generic. It consumes schema and renderer adapters rather than hardcoding project-specific element definitions.

### `@vitrea/render`

`@vitrea/render` now has a browser-safe root entry and explicit server-only subpaths.

Browser-safe root:

- `RenderPage`
- renderer helpers
- tree utilities
- rendering types

Server-only subpaths:

- `@vitrea/render/tailwind`
- `@vitrea/render/server`

This keeps browser code from accidentally importing Node-only helpers.

### `@vitrea/database`

`@vitrea/database` exposes:

- `@vitrea/database`
- `@vitrea/database/client`
- `@vitrea/database/schema`

The `pages` table is the key page storage model:

- `data`
  Page metadata such as title, path, and status.

- `content`
  Draft page tree.

- `pubContent`
  Published page tree.

The website app reads page trees directly from `pages.content` or `pages.pubContent`. There is no separate `elements` table in the current structure.

## Data Model and Rendering Flow

The current page flow is:

1. A site owns one or more `pages`.
2. Each page stores structured page trees in `content` and `pubContent`.
3. The editor loads and mutates those trees through `@vitrea/editor`.
4. Publishing copies the draft tree into `pubContent`.
5. The website app reads `pubContent` and renders it through `@internal/web`.

The renderer flow is:

1. `PageRenderer` receives a list of `RenderElement` nodes.
2. `RenderPage` from `@vitrea/render` walks the tree.
3. The renderer uses `COMPONENT_REGISTRY` from `@internal/web`.
4. Each project-owned React component renders its corresponding element type.

## Environment and Runtime Expectations

The repo-root `.env` is the shared local environment source for both apps.

Important values include:

- `DATABASE_URL`
- `SITE_ID`
- `BETTER_AUTH_URL`
- storage settings for S3-compatible assets

Important runtime expectations:

- The editor dev server loads the repo-root `.env` from `apps/editor/vite.config.ts`.
- The web app loads the repo-root `.env` from `apps/web/next.config.ts`.
- The local website route accepts `SITE_ID` and `WEBSITE_ID`, with `SITE_ID` being the current live repo convention.

## Build and Distribution Pattern

The workspace packages in `packages/` build to `dist`.

The common package pattern is:

- `tsc -p tsconfig.json`
- output written to `dist`
- ESM specifiers normalized by `scripts/fix-esm-imports.mjs`

This allows the workspace packages to expose real runtime entrypoints instead of relying on source-only resolution for published-style package usage.

For source-only internal packages:

- `internal/editor`
- `internal/web`

the packages export their `src` entries directly and use explicit `.ts` / `.tsx` imports where needed for correct Node/Vite resolution.

## Create Package Alignment

`@vitrea/create` now mirrors the current repository architecture.

Generated projects follow the same shape:

- an editor app
- a web app
- internal editor package
- internal web package
- reusable Vitrea packages consumed from the workspace or published packages

The templates also follow the same runtime rules:

- root `.env` loading in app configs
- browser-safe versus server-only entry separation
- website rendering from `pages.content` / `pages.pubContent`

## Practical Rules That Keep This Structure Stable

- Keep browser-safe exports and server-only exports separated by subpath.
- Keep project-specific schema and rendering logic in `internal/*`.
- Keep reusable framework behavior in `packages/*`.
- Keep apps thin and composed from internal + platform packages.
- Treat `dist` as build output only.
- Read page trees from `pages.content` and `pages.pubContent`.
- Load the repo-root `.env` before importing workspace packages that require environment variables at module evaluation time.

## Current Mental Model

The current Vitrea workspace works best if you think about it in four layers:

1. `packages/*`
   The reusable platform.

2. `internal/*`
   The project-specific schema and rendering implementation.

3. `apps/editor`
   The editing surface for that project.

4. `apps/web`
   The published website surface for that project.

That split gives the repo a clear contract:

- the platform owns the editor and rendering infrastructure
- the internal packages define the site
- the apps assemble and run the system
