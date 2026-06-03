import React from "react";
import type { StyleFieldConfig } from "../../types";
import { CollapsibleSection } from "@vitrea/editor-ui/collapsible-section";
import { SpacingFields, SizingFields } from "./spacing-sizing-fields";
import { LayoutFields } from "./layout-fields";
import { TypographyFields } from "./typography-fields";
import { BackgroundFields } from "./background-fields";
import { BorderFields } from "./border-fields";
import { EffectsFields } from "./effects-fields";
import { GenericStyleField } from "./generic-style-field";

const fieldRenderers: Record<string, React.FC<{
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}>> = {
  spacing: SpacingFields,
  sizing: SizingFields,
  layout: LayoutFields,
  typography: TypographyFields,
  background: BackgroundFields,
  border: BorderFields,
  effects: EffectsFields,
};

export function StyleGroup({ group, styles, updateStyle }: {
  group: { label: string; fields: StyleFieldConfig[] };
  styles: Record<string, unknown>;
  updateStyle: (key: string, value: string) => void;
}) {
  const hasValues = group.fields.some((f) => styles[f.name]);
  const [open, setOpen] = React.useState(hasValues);
  const key = group.label.toLowerCase();
  const Renderer = fieldRenderers[key];

  return (
    <CollapsibleSection title={group.label} open={open} onToggle={() => setOpen(!open)}>
      <div className="px-3 pb-3 space-y-2">
        {Renderer
          ? <Renderer fields={group.fields} styles={styles} updateStyle={updateStyle} />
          : group.fields.map((f) => (
              <GenericStyleField key={f.name} field={f} styles={styles} updateStyle={updateStyle} />
            ))
        }
      </div>
    </CollapsibleSection>
  );
}
