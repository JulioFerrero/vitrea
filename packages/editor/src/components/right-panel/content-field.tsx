import { useState } from "react";
import type { FieldConfig } from "../../types";
import { Label, Btn, BtnGroup, CompactInput, inputBase } from "./primitives";
import { ReferencePicker } from "../cms/reference-picker";
import { MediaLibrary } from "../media-library";
import { useCmsStore } from "../../stores/cms-store";
import { useEditorStore } from "../../stores";
import { cn } from "@vitrea/utils";
import { Image as ImageIcon } from "lucide-react";
import type { EditorApi } from "../../types";

export function ContentField({ field, data, updateData, api, siteId }: {
  field: FieldConfig; data: Record<string, unknown>; updateData: (key: string, value: unknown) => void; api?: EditorApi; siteId?: string;
}) {
  const val = data[field.name];
  const [mediaOpen, setMediaOpen] = useState(false);
  const showMediaPicker = field.type === "url" && api && siteId;

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
    <div>
      <CompactInput label={field.label} value={typeof val === "string" ? val : ""}
        onChange={(v) => updateData(field.name, v)} type={field.type === "number" ? "number" : "text"} />
      {showMediaPicker && (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            className="flex items-center gap-1 text-[11px] text-white/70 hover:text-editor-ring transition-colors"
          >
            <ImageIcon className="h-3 w-3 text-white" />
            Media Library
          </button>
          <MediaLibrary
            open={mediaOpen}
            onClose={() => setMediaOpen(false)}
            onSelect={(url) => { updateData(field.name, url); setMediaOpen(false); }}
            siteId={siteId!}
            api={api!}
          />
        </div>
      )}
    </div>
  );
}
