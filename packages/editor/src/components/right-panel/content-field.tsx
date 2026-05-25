import type { FieldConfig } from "../../types";
import { Label, Btn, BtnGroup, CompactInput, inputBase } from "./primitives";
import { ReferencePicker } from "../cms/reference-picker";
import { useCmsStore } from "../../stores/cms-store";
import { useEditorStore } from "../../stores";
import { cn } from "@hi/utils";

export function ContentField({ field, data, updateData }: {
  field: FieldConfig; data: Record<string, unknown>; updateData: (key: string, value: unknown) => void;
}) {
  const val = data[field.name];

  if (field.type === "reference") {
    const ids: string[] = Array.isArray(val) ? val.map(String) : val ? [String(val)] : [];
    const siteId = useEditorStore((s) => s.activeSiteId) ?? "";

    return (
      <div>
        <Label>{field.label}</Label>
        <ReferencePicker
          collection={field.collection ?? ""}
          selectedIds={ids}
          multiple={field.multiple ?? false}
          siteId={siteId}
          onChange={(newIds) => {
            if (field.multiple) {
              updateData(field.name, newIds);
            } else {
              updateData(field.name, newIds[0] ?? null);
            }
          }}
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        <Label>{field.label}</Label>
        <BtnGroup>
          {field.options.map((opt) => (
            <Btn key={opt} active={(val ?? field.options![0]) === opt} onClick={() => updateData(field.name, opt)}>
              {opt}
            </Btn>
          ))}
        </BtnGroup>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <Label>{field.label}</Label>
        <textarea value={typeof val === "string" ? val : ""} onChange={(e) => updateData(field.name, e.target.value)}
          rows={field.rows ?? 2} className={cn(inputBase, " resize-none")} />
      </div>
    );
  }

  return (
    <CompactInput label={field.label} value={typeof val === "string" ? val : ""}
      onChange={(v) => updateData(field.name, v)} type={field.type === "number" ? "number" : "text"} />
  );
}
