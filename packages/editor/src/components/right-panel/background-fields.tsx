import { cn } from "@vitrea/utils";
import type { StyleFieldConfig } from "../../types";
import { Label, ColorField, IconBtnGroup, inputBase } from "./primitives";
import { ICON_MAP } from "./icon-configs";
import { getVal } from "./utils";

export function BackgroundFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const val = getVal(styles, f.name);

        if (f.type === "color") {
          return <ColorField key={f.name} label={f.label ?? f.name} value={val} onChange={(v) => updateStyle(f.name, v)} />;
        }

        if (f.name === "backgroundSize") {
          const icons = ICON_MAP[f.name];
          if (icons) return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons} value={val} onChange={(v) => updateStyle(f.name, v)} />
          );
        }

        if (f.name === "backgroundPosition") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <div className="grid grid-cols-3 gap-0.5">
                {(["left-top", "center-top", "right-top",
                   "left", "center", "right",
                   "left-bottom", "center-bottom", "right-bottom"] as const).map((pos) => (
                  <button type="button" key={pos} onClick={() => updateStyle(f.name, val === pos ? "" : pos)} title={pos}
                    className={cn(
                      "h-6 flex items-center justify-center rounded-md transition-colors",
                      val === pos ? "bg-foreground" : "hover:bg-muted"
                    )}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="1.5"
                        fill={val === pos ? "var(--color-background)" : "var(--color-muted-foreground)"}
                        opacity={val === pos ? 1 : 0.4} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={f.name}>
            <Label>{f.label ?? f.name}</Label>
            <input type="text" value={val} onChange={(e) => updateStyle(f.name, e.target.value)}
              placeholder={f.placeholder} className={inputBase} />
          </div>
        );
      })}
    </>
  );
}
