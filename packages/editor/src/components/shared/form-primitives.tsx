import { cn } from "@hi/utils";

export const inputBase = "w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-colors";

export function GlassLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-medium text-white/90 mb-0.5">{children}</label>;
}

export function GlassSectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{children}</h4>;
}

export function GlassButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "py-1 px-3 rounded-md text-[10px] font-medium transition-colors disabled:opacity-50",
        variant === "primary"
          ? "bg-white text-black hover:bg-white/90"
          : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10",
      )}
    >
      {children}
    </button>
  );
}

export function GlassInput({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      className={inputBase}
    />
  );
}
