# @vitrea/editor

Reusable visual editor package for Vitrea projects.

This package includes the editor UI, schema builders, presets, API entrypoints, and Vite integration used to run the editor app.

## Install

```bash
pnpm add @vitrea/editor
```

## Main Exports

- `EditorApp`, `Editor`, `Dashboard`, `CmsView`
- `EditorProvider`, `useEditorContext`, `useEditorStore`
- element, field, and style builders
- presets like `spacingStyles`, `layoutStyles`, `typographyStyles`
- `@vitrea/editor/api`
- `@vitrea/editor/vite`
- `@vitrea/editor/styles.css`

## Example

```ts
import { defineContainer, defineText, spacingStyles, defineConfig } from "@vitrea/editor";

const section = defineContainer({ type: "section", label: "Section" });
const heading = defineText({ type: "heading", label: "Heading" });

export const config = defineConfig({
  elements: [section, heading],
  styles: [spacingStyles],
});
```
