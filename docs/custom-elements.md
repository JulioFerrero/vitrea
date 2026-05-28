# Custom Element Development

Hi Editor elements define the building blocks of your pages. Each element has a schema (fields), default props, default styles, and a render function.

## Creating an Element

Elements are defined using the `defineElement`, `defineAction`, `defineContainer`, `defineText`, `defineMedia`, or `defineUtility` builders from `@hi/editor`.

### Example: Custom CTA Section

```ts
import { defineElement, textField, urlField, selectField } from "@hi/editor";

export const ctaElement = defineElement({
  type: "cta-section",
  name: "CTA Section",
  icon: "megaphone",
  category: "section",
  fields: {
    heading: textField("Heading"),
    subheading: textField("Subheading"),
    buttonText: textField("Button Text"),
    buttonUrl: urlField("Button URL"),
    variant: selectField("Variant", {
      options: [
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
    }),
  },
  defaultProps: {
    heading: "Get Started Today",
    subheading: "Build something amazing",
    buttonText: "Learn More",
    buttonUrl: "#",
    variant: "dark",
  },
  defaultStyles: {
    padding: { top: "96px", bottom: "96px" },
  },
});
```

## Field Types

| Field | Builder | Description |
|-------|---------|-------------|
| Text | `textField(name)` | Single-line text input |
| Textarea | `textareaField(name)` | Multi-line text input |
| URL | `urlField(name)` | URL input with validation |
| Number | `numberField(name)` | Numeric input |
| Select | `selectField(name, opts)` | Dropdown selection |
| Reference | `referenceField(collection, opts)` | Reference to a CMS collection item |

## Element Categories

| Category | Builder | Description |
|----------|---------|-------------|
| `section` | `defineElement()` | Full-width page sections |
| `container` | `defineContainer()` | Layout containers (Row, Column, Grid) |
| `text` | `defineText()` | Text-based elements (Heading, Text) |
| `media` | `defineMedia()` | Media elements (Image, Video) |
| `action` | `defineAction()` | Interactive elements (Button, Link) |
| `utility` | `defineUtility()` | Structural elements (Divider, Spacer) |

## Style Presets

Elements support style groups that appear in the editor's right panel:

```ts
import {
  backgroundStyles,
  borderStyles,
  effectsStyles,
  layoutStyles,
  sizingStyles,
  spacingStyles,
  typographyStyles,
} from "@hi/editor";

export const myElement = defineElement({
  // ...
  styleGroups: [
    layoutStyles,
    spacingStyles,
    sizingStyles,
    typographyStyles,
    backgroundStyles,
    borderStyles,
    effectsStyles,
  ],
});
```

## Using Elements in Your Site

Elements are registered via the element registry. Import and register them in your site config or app entry point:

```ts
import { ctaElement } from "./elements/cta-element.ts";
// Elements are automatically available once imported
```

## CMS Integration

Elements can reference CMS collection items:

```ts
import { referenceField } from "@hi/editor";

export const productCard = defineElement({
  type: "product-card",
  fields: {
    product: referenceField("products", {
      label: "Product",
    }),
  },
  // ...
});
```

The editor will show a collection picker for reference fields.
