"use client";

import { cn } from "@hi/utils";
import { glassStyle } from "../../lib/glass";

export function Toolbar({
  children,
  className,
  variant = "panel",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "pill";
}) {
  return (
    <div
      className={cn(
        "flex items-center backdrop-blur-[10px] overflow-visible",
        variant === "panel"
          ? "gap-1 rounded-2xl p-1"
          : "gap-0.5 rounded-full p-1",
        className,
      )}
      style={glassStyle}
    >
      {children}
    </div>
  );
}
