"use client";

export function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const spinnerSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const padding = size === "sm" ? "py-0" : "py-12";

  return (
    <div className={`flex items-center justify-center ${padding}`}>
      <div className={`${spinnerSize} border-2 border-white/10 border-t-white/30 rounded-full animate-spin`} />
    </div>
  );
}
