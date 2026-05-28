# Hi Editor — Roadmap to v0.1.0

## Overview

Hi Editor is a self-hosted, open-source visual website builder. This roadmap covers publishing packages to JSR, infrastructure for self-hosting (Docker, Coolify), and the developer scaffolding tool.

---

## Phase 1: Publish to JSR

### 1.1 Fix JSR Blockers

**`process.env` → `Deno.env.get()`**

| Package | File | Fix |
|---------|------|-----|
| `@hi/database` | `src/client.ts` | Replace `process.env.DATABASE_URL` with `Deno.env.get("DATABASE_URL")` |
| `@hi/database` | `drizzle.config.ts` | Same |
| `@hi/auth` | `src/auth.ts` | Replace `process.env.*` with `Deno.env.get()` |
| `@hi/editor` | `src/lib/storage.ts` | Replace `process.env.*` with `Deno.env.get()` |

**`node:*` imports → Deno std or dependency injection**

| Package | File | Fix |
|---------|------|-----|
| `@hi/editor` | `src/server.ts` | `node:path` → `@std/path`, `node:fs/promises` → `@std/fs` |
| `@hi/website` | `src/lib/tailwind.ts` | Dynamic `node:fs/promises` and `node:path` → `@std/fs`, `@std/path` |

**Local path imports → JSR specifiers**

| Consumer | Local Import | JSR Specifier |
|----------|-------------|---------------|
| `@hi/auth` | `../database/src/index.ts` | `jsr:@hi/database` |
| `@hi/auth` | `../utils/src/index.ts` | `jsr:@hi/utils` |
| `@hi/editor` | `../auth/src/auth.ts` | `jsr:@hi/auth` |
| `@hi/editor` | `../auth/src/auth-client.ts` | `jsr:@hi/auth/client` |
| `@hi/editor` | `../auth/src/middleware.ts` | `jsr:@hi/auth/middleware` |
| `@hi/editor` | `../auth/src/crypto.ts` | `jsr:@hi/auth/crypto` |

### 1.2 Minor fixes

- Clean duplicate `react/jsx-runtime` key in `@hi/render/deno.json`
- Confirm `@hi/cms` is dead, remove directory
- Add `publish` config to all packages (include `src/`, exclude tests)

### 1.3 Publish order (dependency chain)

```
1. @hi/utils        (leaf: clsx, tailwind-merge)
2. @hi/ui           (depends on @hi/utils)
3. @hi/database     (depends on drizzle-orm, postgres)
4. @hi/render       (depends on react, hono)
5. @hi/auth         (depends on @hi/database, @hi/utils)
6. @hi/editor       (depends on @hi/auth, @hi/ui, @hi/database, @hi/render)
7. @hi/website      (depends on @hi/editor, @hi/render — example/template, may not need publishing)
```

After each publish, update downstream consumers to use `jsr:` specifiers instead of local paths.

### 1.4 Verification

```bash
deno publish --dry-run    # for each package
deno check packages/*/src/index.ts  # type check all
```

---

## Phase 2: Infrastructure (Docker + Coolify)

### 2.1 Rewrite Dockerfiles (Deno-based)

Current Dockerfiles reference deleted pnpm/Next.js structure. Rewrite for Deno:

- `docker/Dockerfile.editor` — Multi-stage: `denoland/deno:2-alpine`, build Vite SPA, run Hono server
- `docker/Dockerfile.web` — Multi-stage: build Fresh app, serve with Deno

### 2.2 Unified docker-compose.yml

Replace `docker-compose.yml` (dev) + `docker-compose.prod.yml` with a single well-documented file:

```yaml
services:
  postgres:     # PostgreSQL 16 Alpine
  seaweedfs:    # S3-compatible storage (optional)
  editor:       # Editor SPA + Hono API (port 3000)
  web:          # Website/Fresh app (port 8000, optional)
```

Uses `SERVICE_FQDN_*` and `SERVICE_URL_*` env vars for Coolify compatibility.

### 2.3 Coolify service template

Create `coolify.json` with base64-encoded docker-compose.yml:

```json
{
  "hieditor": {
    "documentation": "https://hieditor.com/docs/self-hosting",
    "slogan": "Open-source visual website builder — self-hosted, Deno-powered.",
    "compose": "<base64>",
    "tags": ["cms", "website-builder", "visual-editor", "self-hosted", "deno"],
    "category": "cms",
    "logo": "svgs/hieditor.svg",
    "minversion": "0.0.0",
    "port": "3000"
  }
}
```

Submit PR to `coollabsio/coolify` `templates/service-templates-latest.json`.

### 2.4 Nixpacks config

Create `nixpacks.toml` for Coolify's auto-detect builder:

```toml
[phases.setup]
nixPkgs = ["deno"]

[phases.build]
cmds = ["deno task build:editor"]

[start]
cmd = "deno run -A --env apps/editor/server.ts"
```

### 2.5 Deploy configs

```
deploy/
├── docker-compose.yml   # Production compose
├── coolify.json         # Coolify template
├── nixpacks.toml        # Auto-detect config
├── Dockerfile           # Standalone editor
└── fly.toml             # (optional) Fly.io config
```

---

## Phase 3: `@hi/create` Scaffolder

### 3.1 Package structure

```
packages/create/
├── deno.json
├── src/
│   ├── main.ts           # Entry, parse args
│   ├── prompts.ts        # Interactive CLI
│   ├── scaffold.ts       # File generators
│   ├── templates/        # All template files
│   └── utils.ts          # Helpers
└── README.md
```

### 3.2 Usage

```bash
deno run -A jsr:@hi/create
npx create-hi-editor
```

### 3.3 Interactive prompts

- Project name
- Deployment target (Docker/Coolify/Fly.io/Manual)
- Include example components? (Y/n)
- File storage (SeaweedFS/S3/Cloudflare R2/Skip)
- Initialize git? (Y/n)

### 3.4 Generated project

```
my-site/
├── hi.config.ts
├── deno.json              # Tasks: dev, build, start, db:init
├── .env                   # DATABASE_URL
├── .gitignore
├── components/
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── footer.tsx
└── deploy/
    ├── docker-compose.yml
    ├── coolify.json
    ├── nixpacks.toml
    └── Dockerfile
```

---

## Phase 4: Documentation

- Self-hosting guide (Docker, Coolify, Fly.io, manual)
- JSR install guide (`deno add @hi/editor`)
- Coolify step-by-step with screenshots
- `@hi/create` quickstart
- Component development guide

---

## Execution Priority

| # | Task | Phase | Status |
|---|------|-------|--------|
| 1 | Fix `process.env` in all packages | 1.1 | Pending |
| 2 | Fix `node:*` imports | 1.1 | Pending |
| 3 | Minor fixes (duplicates, dead packages) | 1.2 | Pending |
| 4 | Add publish config to all packages | 1.2 | Pending |
| 5 | Convert local paths to JSR specifiers | 1.1 | Pending |
| 6 | Dry-run publish all packages | 1.4 | Pending |
| 7 | Publish to JSR | 1.3 | Pending |
| 8 | Rewrite Dockerfiles (Deno) | 2.1 | Done |
| 9 | Unified docker-compose.yml | 2.2 | Done |
| 10 | Coolify template + nixpacks | 2.3-2.4 | Done |
| 11 | `@hi/create` scaffolder | 3 | Done |
| 12 | Documentation | 4 | Done |
