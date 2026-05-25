import type { FieldConfig } from "../types";

type FieldOptions = {
  name: string;
  label: string;
} & Record<string, unknown>;

export function createField(
  baseType: FieldConfig["type"],
  extra?: (opts: FieldOptions) => Partial<FieldConfig>,
): ((nameOrOpts: string | FieldOptions, maybeOpts?: Record<string, unknown>) => FieldConfig) {
  return (nameOrOpts: string | FieldOptions, maybeOpts?: Record<string, unknown>) => {
    let name: string;
    let label: string;
    let rest: Record<string, unknown>;

    if (typeof nameOrOpts === "string") {
      name = nameOrOpts;
      const opts = (maybeOpts ?? {}) as Record<string, unknown>;
      label = (opts.label as string) ?? name;
      const { label: _l, ...r } = opts;
      rest = r;
    } else {
      const opts = nameOrOpts as FieldOptions;
      name = opts.name;
      label = opts.label;
      const { name: _n, label: _l, ...r } = opts;
      rest = r as Record<string, unknown>;
    }

    const base: FieldConfig = { name, label, type: baseType };
    if (extra && typeof nameOrOpts !== "string") {
      Object.assign(base, extra(nameOrOpts as FieldOptions));
    }
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && !(key in base)) {
        (base as unknown as Record<string, unknown>)[key] = value;
      }
    }
    return base;
  };
}

export const textField = createField("text");
export const textareaField = createField("textarea");
export const selectField = createField("select", (opts) => ({
  options: opts.options as string[],
}));
export const urlField = createField("url");
export const numberField = createField("number");
