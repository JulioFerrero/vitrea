import { cn } from "@hi/utils";
import type { StyleFieldConfig } from "../../types";
import { Label, Btn, BtnGroup, IconBtnGroup, ColorField, inputBase } from "./primitives";
import { ICON_MAP, WEIGHT_LABELS } from "./icon-configs";
import { getVal } from "./utils";

export function TypographyFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const val = getVal(styles, f.name);

        if (f.name === "textAlign") {
          const icons = ICON_MAP[f.name];
          if (icons) return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons} value={val} onChange={(v) => updateStyle(f.name, v)} />
          );
        }

        if (f.name === "color") {
          return <ColorField key={f.name} label={f.label ?? f.name} value={val} onChange={(v) => updateStyle(f.name, v)} />;
        }

        if (f.name === "fontFamily") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <BtnGroup>
                {f.options?.map((opt) => (
                  <Btn key={opt} active={val === opt} onClick={() => updateStyle(f.name, val === opt ? "" : opt)}>
                    <span className={opt === "mono" ? "font-mono" : opt === "serif" ? "font-serif" : "font-sans"}>Aa</span>
                  </Btn>
                ))}
              </BtnGroup>
            </div>
          );
        }

        if (f.name === "fontWeight") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <div className="flex flex-wrap gap-0.5">
                {f.options?.map((opt) => (
                  <button type="button" key={opt} onClick={() => updateStyle(f.name, val === opt ? "" : opt)} title={opt}
                    className={cn(
                      "px-2 py-1 text-[10px] font-medium rounded-md transition-colors",
                      opt === "bold" || opt === "extrabold" || opt === "black" ? "font-bold" : opt === "semibold" || opt === "medium" ? "font-medium" : "font-normal",
                       val === opt ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}>
                    {WEIGHT_LABELS[opt] ?? opt}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (f.name === "lineHeight") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <BtnGroup>
                {f.options?.map((opt) => (
                  <Btn key={opt} active={val === opt} onClick={() => updateStyle(f.name, val === opt ? "" : opt)}>
                    {opt}
                  </Btn>
                ))}
              </BtnGroup>
            </div>
          );
        }

        if (f.name === "letterSpacing") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <BtnGroup>
                {f.options?.map((opt) => (
                  <Btn key={opt} active={val === opt} onClick={() => updateStyle(f.name, val === opt ? "" : opt)}>
                    {opt}
                  </Btn>
                ))}
              </BtnGroup>
            </div>
          );
        }

        return (
          <div key={f.name}>
            <Label>{f.label ?? f.name}</Label>
            <input type="text" value={val} onChange={(e) => updateStyle(f.name, e.target.value)}
              placeholder="—" className={inputBase} />
          </div>
        );
      })}
    </>
  );
}
