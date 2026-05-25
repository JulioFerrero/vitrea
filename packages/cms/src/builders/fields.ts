import type { CmsFieldConfig } from "../types";

type FieldOpts = {
  label?: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  collection?: string;
  multiple?: boolean;
  of?: CmsFieldConfig[];
  [key: string]: unknown;
};

export function createCmsField(
  baseType: CmsFieldConfig["type"],
): (name: string, opts?: FieldOpts) => CmsFieldConfig {
  return (name: string, opts?: FieldOpts) => {
    const { label, ...rest } = opts ?? {};
    const cfg: CmsFieldConfig = {
      name,
      label: label ?? name,
      type: baseType,
    };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        (cfg as Record<string, unknown>)[key] = value;
      }
    }
    return cfg;
  };
}

export const textField = createCmsField("text");
export const textareaField = createCmsField("textarea");
export const selectField = createCmsField("select");
export const urlField = createCmsField("url");
export const numberField = createCmsField("number");
export const imageField = createCmsField("image");
export const booleanField = createCmsField("boolean");

export const arrayField = (name: string, opts: { label?: string; of: CmsFieldConfig[]; preview?: string } & Record<string, unknown>): CmsFieldConfig => ({
  name,
  label: opts.label ?? name,
  type: "array",
  of: opts.of,
  preview: opts.preview,
});

export const referenceField = (
  name: string,
  opts: { label?: string; collection: string; multiple?: boolean },
): CmsFieldConfig => ({
  name,
  label: opts.label ?? name,
  type: "reference",
  collection: opts.collection,
  multiple: opts.multiple ?? false,
});
