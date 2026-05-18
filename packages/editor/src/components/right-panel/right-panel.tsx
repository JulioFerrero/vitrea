"use client";

import React from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import type { PageItem, FieldConfig, StyleFieldConfig } from "../../types";
import { cn } from "@hi/utils";
import {
  Trash2, Copy, ChevronRight,
  Square, RectangleHorizontal, GalleryHorizontal, GalleryHorizontalEnd,
  GalleryVertical, GalleryVerticalEnd, Grid2x2, EyeOff,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd, AlignHorizontalJustifyCenter,
  AlignHorizontalSpaceBetween, AlignHorizontalSpaceAround, AlignHorizontalDistributeCenter,
  AlignVerticalJustifyStart, AlignVerticalJustifyEnd, AlignVerticalJustifyCenter,
  StretchVertical, Baseline,
  WrapText, ArrowRightLeft,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowUpDown, Eye, Scroll, PanelBottomClose,
  SquareDashed, SquareRoundCorner, Circle,
  Maximize, Maximize2, Minimize2,
  Minus, Spline, Ellipsis, Equal, Slash,
} from "lucide-react";

function derivePath(slug: string, parentId: string | undefined, pages: PageItem[]): string {
  if (!parentId) return "/" + slug;
  const parent = pages.find((p) => p.id === parentId);
  if (!parent) return "/" + slug;
  return parent.data.path.replace(/\/$/, "") + "/" + slug;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type LucideIcon = React.FC<{ className?: string }>;
type IconItem = { value: string; icon: LucideIcon; label: string };

const DISPLAY_ICONS: IconItem[] = [
  { value: "block", icon: Square, label: "Block" },
  { value: "inline-block", icon: RectangleHorizontal, label: "Inline Block" },
  { value: "flex", icon: GalleryHorizontal, label: "Flex" },
  { value: "inline-flex", icon: GalleryHorizontal, label: "Inline Flex" },
  { value: "grid", icon: Grid2x2, label: "Grid" },
  { value: "hidden", icon: EyeOff, label: "Hidden" },
];

const FLEX_DIR_ICONS: IconItem[] = [
  { value: "row", icon: GalleryHorizontal, label: "Row" },
  { value: "row-reverse", icon: GalleryHorizontalEnd, label: "Row Reverse" },
  { value: "col", icon: GalleryVertical, label: "Column" },
  { value: "col-reverse", icon: GalleryVerticalEnd, label: "Column Reverse" },
];

const JUSTIFY_ICONS: IconItem[] = [
  { value: "start", icon: AlignHorizontalJustifyStart, label: "Start" },
  { value: "end", icon: AlignHorizontalJustifyEnd, label: "End" },
  { value: "center", icon: AlignHorizontalJustifyCenter, label: "Center" },
  { value: "between", icon: AlignHorizontalSpaceBetween, label: "Space Between" },
  { value: "around", icon: AlignHorizontalSpaceAround, label: "Space Around" },
  { value: "evenly", icon: AlignHorizontalDistributeCenter, label: "Space Evenly" },
];

const ALIGN_ICONS: IconItem[] = [
  { value: "start", icon: AlignVerticalJustifyStart, label: "Start" },
  { value: "end", icon: AlignVerticalJustifyEnd, label: "End" },
  { value: "center", icon: AlignVerticalJustifyCenter, label: "Center" },
  { value: "stretch", icon: StretchVertical, label: "Stretch" },
  { value: "baseline", icon: Baseline, label: "Baseline" },
];

const WRAP_ICONS: IconItem[] = [
  { value: "wrap", icon: WrapText, label: "Wrap" },
  { value: "nowrap", icon: ArrowRightLeft, label: "No Wrap" },
  { value: "reverse", icon: WrapText, label: "Wrap Reverse" },
];

const TEXT_ALIGN_ICONS: IconItem[] = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
  { value: "justify", icon: AlignJustify, label: "Justify" },
];

const OVERFLOW_ICONS: IconItem[] = [
  { value: "auto", icon: ArrowUpDown, label: "Auto" },
  { value: "hidden", icon: PanelBottomClose, label: "Hidden" },
  { value: "visible", icon: Eye, label: "Visible" },
  { value: "scroll", icon: Scroll, label: "Scroll" },
];

const BORDER_RADIUS_ICONS: IconItem[] = [
  { value: "none", icon: Square, label: "None" },
  { value: "sm", icon: SquareDashed, label: "Small" },
  { value: "md", icon: SquareRoundCorner, label: "Medium" },
  { value: "lg", icon: SquareRoundCorner, label: "Large" },
  { value: "xl", icon: SquareRoundCorner, label: "Extra Large" },
  { value: "full", icon: Circle, label: "Full" },
];

const BG_SIZE_ICONS: IconItem[] = [
  { value: "auto", icon: Maximize, label: "Auto" },
  { value: "cover", icon: Maximize2, label: "Cover" },
  { value: "contain", icon: Minimize2, label: "Contain" },
];

const BORDER_STYLE_ICONS: IconItem[] = [
  { value: "solid", icon: Minus, label: "Solid" },
  { value: "dashed", icon: Spline, label: "Dashed" },
  { value: "dotted", icon: Ellipsis, label: "Dotted" },
  { value: "double", icon: Equal, label: "Double" },
  { value: "none", icon: Slash, label: "None" },
];

const WEIGHT_LABELS: Record<string, string> = {
  thin: "100", extralight: "200", light: "300", normal: "400", medium: "500",
  semibold: "600", bold: "700", extrabold: "800", black: "900",
};

const ICON_MAP: Record<string, IconItem[]> = {
  display: DISPLAY_ICONS,
  flexDirection: FLEX_DIR_ICONS,
  justifyContent: JUSTIFY_ICONS,
  alignItems: ALIGN_ICONS,
  flexWrap: WRAP_ICONS,
  textAlign: TEXT_ALIGN_ICONS,
  overflow: OVERFLOW_ICONS,
  borderRadius: BORDER_RADIUS_ICONS,
  backgroundSize: BG_SIZE_ICONS,
  borderStyle: BORDER_STYLE_ICONS,
};

export function RightPanel() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const elements = useEditorStore((s) => s.elements);
  const activePageId = useEditorStore((s) => s.activePageId);
  const pages = useEditorStore((s) => s.pages);
  const updatePageLocal = useEditorStore((s) => s.updatePageLocal);
  const { schema, actions } = useEditorContext();

  const selected = elements.find((e) => e.id === selectedElementId);
  const activePage = pages.find((p) => p.id === activePageId);

  if (!selected) {
    return (
      <div className="w-[240px] h-full flex flex-col bg-black/80 backdrop-blur-xl relative">
        {activePage ? (
          <>
            <SectionHeader title="Page" />
            <div className="px-3 pb-2 space-y-3">
              <CompactInput label="Title" value={activePage.data.title} onChange={(v) => updatePageLocal(activePage.id, { data: { title: v } })} />
              <CompactInput label="Slug" value={activePage.slug} onChange={(v) => {
                const s = slugify(v);
                updatePageLocal(activePage.id, { slug: s, data: { path: derivePath(s, activePage.data.parentId, pages) } });
              }} />
              <div>
                <Label>Status</Label>
                <BtnGroup>
                  {(["draft", "published"] as const).map((s) => (
                    <Btn key={s} active={activePage.data.status === s} onClick={() => updatePageLocal(activePage.id, { data: { status: s } })}>
                      {s}
                    </Btn>
                  ))}
                </BtnGroup>
              </div>
            </div>
          </>
        ) : (
          <div className="px-3 py-8 text-[10px] text-white/20 text-center">Select a page</div>
        )}
      </div>
    );
  }

  const typeConfig = schema.elementTypes.find((t) => t.type === selected.type);
  const updateData = (key: string, value: unknown) => actions.updateElementData(selected.id, { ...selected.data, [key]: value });
  const updateStyle = (key: string, value: string) => actions.updateElementStyles(selected.id, { ...selected.styles, [key]: value || undefined });

  return (
    <div className="w-[240px] h-full flex flex-col bg-black/80 backdrop-blur-xl relative">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[11px] font-semibold capitalize text-white/80">{typeConfig?.label ?? selected.type}</span>
        <div className="flex items-center gap-0.5">
          <IconBtn onClick={() => actions.duplicateElement(selected.id)} title="Duplicate" hoverColor="editor-ring">
            <Copy className="h-3 w-3" />
          </IconBtn>
          <IconBtn onClick={() => actions.deleteElement(selected.id)} title="Delete" hoverColor="destructive">
            <Trash2 className="h-3 w-3" />
          </IconBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto editor-scroll">
        {typeConfig && typeConfig.fields.length > 0 && (
          <div className="border-b border-white/[0.06]">
            <SectionHeader title="Content" />
            <div className="px-3 pb-3 space-y-2">
              {typeConfig.fields.map((f) => (
                <ContentField key={f.name} field={f} data={selected.data} updateData={updateData} />
              ))}
            </div>
          </div>
        )}

        {Object.entries(schema.styleGroups)
          .filter(([k]) => !typeConfig?.styleGroups || typeConfig.styleGroups.includes(k))
          .map(([k, group]) => (
            <StyleGroup key={k} group={group} styles={selected.styles} updateStyle={updateStyle} />
          ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, defaultOpen = true, open: controlledOpen, onToggle }: {
  title: string; defaultOpen?: boolean; open?: boolean; onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = onToggle ?? (() => setInternalOpen(!internalOpen));

  return (
    <button type="button" onClick={toggle}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-white/[0.04] transition-colors">
      <ChevronRight className={cn("h-3 w-3 text-white/30 transition-transform duration-150", open && "rotate-90")} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">{title}</span>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-medium text-white/50 mb-0.5">{children}</label>;
}

function IconBtn({ children, onClick, title, hoverColor }: {
  children: React.ReactNode; onClick: () => void; title: string; hoverColor?: string;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn("p-1 rounded text-white/40 transition-colors",
        hoverColor === "destructive"
          ? "hover:text-destructive hover:bg-destructive/10"
          : "hover:text-editor-ring hover:bg-editor-selected"
      )}>
      {children}
    </button>
  );
}

const inputBase = "w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-colors";

function CompactInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputBase} />
    </div>
  );
}

function BtnGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex gap-0.5", className)}>{children}</div>;
}

function Btn({ children, active, onClick, className }: {
  children: React.ReactNode; active: boolean; onClick: () => void; className?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex-1 py-1 text-[10px] font-medium rounded-md transition-colors text-center",
        active ? "bg-white text-black" : "text-white/50 hover:bg-white/10 hover:text-white/70",
        className
      )}>
      {children}
    </button>
  );
}

function IconBtnGroup({ icons, value, onChange, label }: {
  icons: IconItem[]; value: string; onChange: (v: string) => void; label?: string;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-0.5">
        {icons.map((item) => (
          <button type="button" key={item.value} onClick={() => onChange(value === item.value ? "" : item.value)} title={item.label}
            className={cn(
              "flex-1 h-7 flex items-center justify-center rounded-md transition-colors",
              value === item.value
                ? "bg-white text-black"
                : "text-white/50 hover:bg-white/10 hover:text-white/70"
            )}>
            <item.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ContentField({ field, data, updateData }: {
  field: FieldConfig; data: Record<string, unknown>; updateData: (key: string, value: unknown) => void;
}) {
  const val = data[field.name];

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

function StyleGroup({ group, styles, updateStyle }: {
  group: { label: string; fields: StyleFieldConfig[] };
  styles: Record<string, unknown>;
  updateStyle: (key: string, value: string) => void;
}) {
  const hasValues = group.fields.some((f) => styles[f.name]);
  const [open, setOpen] = React.useState(hasValues);
  const key = group.label.toLowerCase();

  return (
    <div className={cn(open && "border-b border-white/[0.06]")}>
      <SectionHeader title={group.label} open={open} onToggle={() => setOpen(!open)} />
      <div className={cn(
        "grid transition-[grid-template-rows] duration-150 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-2">
            {key === "spacing" ? (
              <SpacingFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "sizing" ? (
              <SizingFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "layout" ? (
              <LayoutFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "typography" ? (
              <TypographyFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "background" ? (
              <BackgroundFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "border" ? (
              <BorderFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : key === "effects" ? (
              <EffectsFields fields={group.fields} styles={styles} updateStyle={updateStyle} />
            ) : (
              group.fields.map((f) => (
                <GenericStyleField key={f.name} field={f} styles={styles} updateStyle={updateStyle} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getVal(styles: Record<string, unknown>, name: string): string {
  return typeof styles[name] === "string" ? String(styles[name]) : "";
}

function SpacingFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {fields.map((f) => (
        <div key={f.name}>
          <Label>{f.label ?? f.name}</Label>
          <input type="text" value={getVal(styles, f.name)} onChange={(e) => updateStyle(f.name, e.target.value)}
            placeholder="—" className={inputBase} />
        </div>
      ))}
    </div>
  );
}

function SizingFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {fields.map((f) => (
        <div key={f.name}>
          <Label>{f.label ?? f.name}</Label>
          <input type="text" value={getVal(styles, f.name)} onChange={(e) => updateStyle(f.name, e.target.value)}
            placeholder="—" className={inputBase} />
        </div>
      ))}
    </div>
  );
}

function LayoutFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const icons = ICON_MAP[f.name];
        if (icons) {
          return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons}
              value={getVal(styles, f.name)} onChange={(v) => updateStyle(f.name, v)} />
          );
        }
        if (f.name === "gap") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <input type="text" value={getVal(styles, f.name)} onChange={(e) => updateStyle(f.name, e.target.value)}
                placeholder="—" className={inputBase} />
            </div>
          );
        }
        if (f.name === "gridTemplateColumns") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <BtnGroup>
                {f.options?.map((opt) => (
                  <Btn key={opt} active={getVal(styles, f.name) === opt} onClick={() => updateStyle(f.name, getVal(styles, f.name) === opt ? "" : opt)}>
                    {opt}
                  </Btn>
                ))}
              </BtnGroup>
            </div>
          );
        }
        return <GenericStyleField key={f.name} field={f} styles={styles} updateStyle={updateStyle} />;
      })}
    </>
  );
}

function TypographyFields({ fields, styles, updateStyle }: {
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
                       val === opt ? "bg-white text-black" : "text-white/50 hover:bg-white/10 hover:text-white/70"
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

function BackgroundFields({ fields, styles, updateStyle }: {
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

function BorderFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const val = getVal(styles, f.name);

        if (f.name === "borderRadius") {
          const icons = ICON_MAP[f.name];
          if (icons) return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons} value={val} onChange={(v) => updateStyle(f.name, v)} />
          );
        }

        if (f.name === "borderWidth") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <BtnGroup>
                <Btn active={!val} onClick={() => updateStyle(f.name, "")}>—</Btn>
                {f.options?.map((opt) => (
                  <Btn key={opt} active={val === opt} onClick={() => updateStyle(f.name, opt)}>
                    {opt}
                  </Btn>
                ))}
              </BtnGroup>
            </div>
          );
        }

        if (f.name === "borderStyle") {
          const icons = ICON_MAP[f.name];
          if (icons) return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons} value={val} onChange={(v) => updateStyle(f.name, v)} />
          );
        }

        if (f.type === "color") {
          return <ColorField key={f.name} label={f.label ?? f.name} value={val} onChange={(v) => updateStyle(f.name, v)} />;
        }

        return <GenericStyleField key={f.name} field={f} styles={styles} updateStyle={updateStyle} />;
      })}
    </>
  );
}

function EffectsFields({ fields, styles, updateStyle }: {
  fields: StyleFieldConfig[]; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const val = getVal(styles, f.name);

        if (f.name === "overflow") {
          const icons = ICON_MAP[f.name];
          if (icons) return (
            <IconBtnGroup key={f.name} label={f.label ?? f.name} icons={icons} value={val} onChange={(v) => updateStyle(f.name, v)} />
          );
        }

        if (f.name === "opacity") {
          return (
            <div key={f.name}>
              <Label>{f.label ?? f.name}</Label>
              <input type="text" value={val} onChange={(e) => updateStyle(f.name, e.target.value)}
                placeholder="—" className={inputBase} />
            </div>
          );
        }

        return <GenericStyleField key={f.name} field={f} styles={styles} updateStyle={updateStyle} />;
      })}
    </>
  );
}

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-shrink-0">
          <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <div className="w-7 h-7 rounded-md border border-border/60 shadow-inner"
            style={{ backgroundColor: value || "#000000" }} />
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="#000" className={cn(inputBase, "flex-1 min-w-0")} />
      </div>
    </div>
  );
}

function GenericStyleField({ field, styles, updateStyle }: {
  field: StyleFieldConfig; styles: Record<string, unknown>; updateStyle: (k: string, v: string) => void;
}) {
  const val = getVal(styles, field.name);

  if (field.type === "color") {
    return <ColorField label={field.label ?? field.name} value={val} onChange={(v) => updateStyle(field.name, v)} />;
  }

  const icons = ICON_MAP[field.name];
  if (icons) {
    return <IconBtnGroup label={field.label ?? field.name} icons={icons} value={val} onChange={(v) => updateStyle(field.name, v)} />;
  }

  if (field.options && field.options.length <= 8) {
    return (
      <div>
        <Label>{field.label ?? field.name}</Label>
        <BtnGroup>
          <Btn active={!val} onClick={() => updateStyle(field.name, "")}>—</Btn>
          {field.options.map((opt) => (
            <Btn key={opt} active={val === opt} onClick={() => updateStyle(field.name, opt)}>
              {opt}
            </Btn>
          ))}
        </BtnGroup>
      </div>
    );
  }

  return (
    <div>
      <Label>{field.label ?? field.name}</Label>
      <input type="text" value={val} onChange={(e) => updateStyle(field.name, e.target.value)}
        placeholder={field.placeholder ?? "—"} className={inputBase} />
    </div>
  );
}
