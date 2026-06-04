# @vitrea/ui

Shared React UI kit for Vitrea apps.

This package provides base interface components like buttons, inputs, dialogs, popovers, tabs, cards, badges, and more.

## Install

```bash
pnpm add @vitrea/ui
```

## Example

```tsx
import { Button, Card, CardContent, CardTitle } from "@vitrea/ui";

export function Example() {
  return (
    <Card>
      <CardTitle>Vitrea</CardTitle>
      <CardContent>
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```
