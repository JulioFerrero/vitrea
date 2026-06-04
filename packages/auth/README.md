# @vitrea/auth

Authentication package for Vitrea projects.

This package wraps Better Auth with the Vitrea database schema and exports the server auth instance, client helpers, middleware helpers, and crypto utilities used by Vitrea apps.

## Install

```bash
pnpm add @vitrea/auth
```

## Exports

- `@vitrea/auth`
- `@vitrea/auth/client`
- `@vitrea/auth/middleware`
- `@vitrea/auth/crypto`

## Example

```ts
import { auth } from "@vitrea/auth";

export const sessionHandler = auth.handler;
```
