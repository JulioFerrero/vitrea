# @vitrea/editor-ui

Shared UI primitives for the Vitrea editor.

This package contains reusable controls like dialogs, panels, toolbars, uploads, empty states, and glass-style helpers.

## Install

```bash
pnpm add @vitrea/editor-ui
```

## Example

```tsx
import { Panel, Toolbar, ConfirmDialog } from "@vitrea/editor-ui";

export function Example() {
  return (
    <Panel>
      <Toolbar />
      <ConfirmDialog open={false} onClose={() => {}} title="Delete item?" />
    </Panel>
  );
}
```
