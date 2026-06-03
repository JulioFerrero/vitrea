import React from "react";
import { cn } from "@hi/utils";
import { inputBase, Button as SharedButton, Input as SharedInput } from "@hi/editor-ui/form-primitives";
export { inputBase } from "@hi/editor-ui/form-primitives";
export { Button, Input } from "@hi/editor-ui/form-primitives";

export { CollapsibleSection } from "@hi/editor-ui/collapsible-section";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 px-3 py-1.5"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">{children}</span></div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-white/90 mb-0.5">{children}</label>;
}

export function CompactInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputBase} />
    </div>
  );
}

export function BtnGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex gap-0.5", className)}>{children}</div>;
}

export function Btn({ children, active, onClick, className }: {
  children: React.ReactNode; active: boolean; onClick: () => void; className?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex-1 py-1 text-[11px] font-medium rounded-md transition-colors text-center",
        active ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white",
        className
      )}>
      {children}
    </button>
  );
}

export function IconBtnGroup({ icons, value, onChange, label }: {
  icons: { value: string; icon: React.FC<{ className?: string }>; label: string }[];
  value: string; onChange: (v: string) => void; label?: string;
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
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}>
            <item.icon className="h-4 w-4 text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ColorField({ label, value, onChange }: {
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
