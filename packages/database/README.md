# @vitrea/database

Database client and schema package for Vitrea.

This package exports the shared Postgres client, Drizzle schema, migration files, and JSON types used by the editor, auth layer, and website runtime.

## Install

```bash
pnpm add @vitrea/database drizzle-orm postgres
```

## Example

```ts
import { db, pages } from "@vitrea/database";
import { eq } from "drizzle-orm";

const homePage = await db.query.pages.findFirst({
  where: eq(pages.slug, "home"),
});
```
