import { cn } from "@hi/utils";

export const inputBase = "w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-colors";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-white/90 mb-0.5">{children}</label>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{children}</h4>;
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "outline" | "ghost";
  type?: "button" | "submit";
  className?: string;
}) {
  const base = "py-1 px-3 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50";
  const styles = {
    primary: "bg-white text-black hover:bg-white/90",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10",
    outline: "border border-white/10 text-white/50 hover:bg-white/10 hover:text-white",
    ghost: "text-white/80 hover:bg-white/10 hover:text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, styles[variant], className)}>
      {children}
    </button>
  );
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
  className,
  onKeyDown,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      className={cn(inputBase, className)}
    />
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Alert({ children, variant = "success" }: { children: React.ReactNode; variant?: "success" | "error" }) {
  return (
    <p className={cn(
      "text-xs rounded-lg px-3 py-2",
      variant === "success"
        ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/[0.1]"
        : "bg-red-500/[0.08] text-red-400 border border-red-500/[0.1]"
    )}>
      {children}
    </p>
  );
}

export function Divider() {
  return <div className="h-px bg-white/[0.06]" />;
}

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" | "info"; className?: string }) {
  const styles = {
    default: "bg-white/5 text-white/40 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-white/10 text-white/60 border-white/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}

export function ColorInput({ value, onChange, presets }: { value: string; onChange: (v: string) => void; presets?: string[] }) {
  const defaultPresets = ["#7B61FF", "#FF6B6B", "#4ECDC4", "#FFE66D", "#FF8A5C", "#A8E6CF", "#FF61D2", "#6C5CE7"];
  const swatches = presets ?? defaultPresets;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 rounded-md border border-white/10 bg-white/[0.06] cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
      />
      {swatches.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "h-6 w-6 rounded-full border-2 transition-all",
            value === c ? "border-white/60 scale-110" : "border-transparent hover:border-white/20",
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
