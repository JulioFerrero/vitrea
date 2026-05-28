# JSR Package Guide

All Hi Editor packages are published on [JSR](https://jsr.io) under the `@hi` scope.

## Installing Packages

### Deno

```bash
deno add @hi/editor
```

### Node.js / npm

```bash
npx jsr add @hi/editor
```

## Available Packages

### `@hi/utils`

Utility functions. Zero dependencies.

```ts
import { cn, slugify, buildPath } from "@hi/utils";

cn("px-4", "py-2", condition && "bg-red-500");
slugify("Hello World"); // "hello-world"
buildPath("pages", "home", "hero"); // "pages/home/hero"
```

### `@hi/database`

Drizzle ORM schema, client, and migrations.

```ts
import { db } from "@hi/database";
import { pages, elements } from "@hi/database";
```

Requires `DATABASE_URL` environment variable.

### `@hi/render`

Element renderer and tree utilities. Renders element trees to HTML.

```ts
import { renderElement, renderPage } from "@hi/render";
```

### `@hi/ui`

UI component library built on Radix UI primitives. Works with React and Preact.

```ts
import { Button } from "@hi/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@hi/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@hi/ui/card";
```

Components: Button, Badge, Card, Collapsible, Context Menu, Dialog, Field, Input, Popover, Scroll Area, Select, Separator, Skeleton, Switch, Tabs, Tooltip.

### `@hi/auth`

Authentication with Better Auth. Includes middleware for Hono.

```ts
import { auth } from "@hi/auth";
import { authMiddleware, requireAuth, requireAdmin } from "@hi/auth/middleware";
import { authClient } from "@hi/auth/client";
```

### `@hi/cms`

CMS collection schema builder.

```ts
import { defineCollection, textField, referenceField } from "@hi/cms";

const posts = defineCollection({
  name: "Blog Posts",
  fields: {
    title: textField("Title"),
    content: textField("Content"),
  },
});
```

### `@hi/editor`

Element definitions, style presets, API routes, and the server.

```ts
import { defineElement, textField, createField } from "@hi/editor";
import { createServer } from "@hi/editor/server";
import { app } from "@hi/editor/api";
```

Subpath exports:
- `@hi/editor` — element builders, fields, presets
- `@hi/editor/api` — Hono API app
- `@hi/editor/server` — `createServer()` for Deno

### `@hi/website`

Component registry, page renderer, built-in sections, and Tailwind CSS generator.

```ts
import { renderPage, COMPONENT_REGISTRY } from "@hi/website";
import { tailwindCssResponse } from "@hi/website";
```

### `@hi/create`

Project scaffolder CLI.

```bash
deno run -A jsr:@hi/create
```
