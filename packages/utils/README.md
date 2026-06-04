# @vitrea/utils

Small shared utility helpers for Vitrea packages.

## Install

```bash
pnpm add @vitrea/utils
```

## Exports

- `cn(...inputs)`
- `slugify(text)`
- `buildPath(segments)`

## Example

```ts
import { cn, slugify, buildPath } from "@vitrea/utils";

const className = cn("rounded", true && "px-4");
const slug = slugify("Hello World");
const path = buildPath(["blog", slug]);
```
