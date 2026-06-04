# @vitrea/render

Renderer and tree utilities for Vitrea page content.

This package renders element trees with React, provides immutable tree helpers, and exposes server-side Tailwind helpers through explicit subpaths.

## Install

```bash
pnpm add @vitrea/render
```

## Example

```tsx
import { RenderPage, createElement } from "@vitrea/render";

const content = [createElement("section")];

export function Page() {
  return <RenderPage content={content} renderer={{}} />;
}
```
