"use client";

import type { ComponentType } from "react";
import { cn } from "@hi/utils";

export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tooltipPosition = "bottom",
  iconSize = "h-3.5 w-3.5",
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom";
  iconSize?: string;
  className?: string;
}) {
  const tooltipClasses =
    tooltipPosition === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  return (
    <div className={cn("relative group/tip hover:z-[200]", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="size-8 hover:bg-white/10 flex items-center text-white duration-200 active:scale-95 justify-center cursor-pointer rounded-full"
        style={{ opacity: 0.85 }}
      >
        <Icon className={iconSize} />
      </button>
      {label && (
        <div className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[200]",
          tooltipClasses,
        )}>
          <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
            <span>{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
