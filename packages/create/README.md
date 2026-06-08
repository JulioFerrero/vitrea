# @vitrea/create

Scaffold a new Vitrea project.

## Usage

```bash
pnpm dlx @vitrea/create
```

Create into the current folder:

```bash
pnpm dlx @vitrea/create .
```

Preview without writing files:

```bash
pnpm dlx @vitrea/create --preview
```

## Import Components

Import React components from a GitHub or git repository into a scaffolded Vitrea project:

```bash
pnpm exec vitrea import-components https://github.com/acme/ui-blocks
```

The importer requires a manifest file at the root of the source repository:

- `vitrea.components.json`
- `vitrea.import.json`

Vitrea reads the component directory, generated prefix, explicit component entries, and required dependencies only from this manifest. It does not try to auto-discover components or infer dependencies without the config.

Example manifest:

```json
{
  "name": "Acme UI Blocks",
  "version": "1.2.0",
  "prefix": "acme",
  "componentDir": "src/components",
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^12.0.0"
  },
  "peerDependencies": {
    "react-icons": "^5.4.0"
  },
  "components": [
    {
      "source": "src/components/Hero.tsx",
      "export": "Hero",
      "type": "acme-hero",
      "label": "Acme Hero",
      "props": ["title", "subtitle", "primaryCtaText", "primaryCtaHref"]
    },
    {
      "source": "src/components/Pricing.tsx",
      "export": "PricingSection",
      "type": "acme-pricing",
      "label": "Acme Pricing"
    }
  ]
}
```

Manifest fields:

- `name`: project or library name shown in CLI notes
- `version`: version shown in CLI notes
- `prefix`: required prefix for generated Vitrea component types
- `componentDir`: required directory to import from
- `dependencies`: packages added to `internal/web/package.json`
- `peerDependencies`: also treated as required install hints
- `components`: required explicit entries to import

Component entry fields:

- `source`: path to the source file inside the repo
- `export`: required export name to use
- `type`: required final Vitrea element type slug
- `label`: required label shown in the editor
- `props`: explicit prop names for generated editor fields

## After Scaffolding

```bash
pnpm install
pnpm run vitrea:setup
pnpm dev
```
