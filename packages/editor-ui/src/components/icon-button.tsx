"use client";

import { cn } from "@vitrea/utils";
import type { LucideIcon } from "lucide-react";

export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tooltipPosition = "bottom",
  iconSize = "h-3.5 w-3.5",
  className,
}: {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  iconSize?: string;
  className?: string;
}) {
  const tipPos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div className={cn("relative group/tip hover:z-[200]", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="size-8 hover:bg-white/10 flex items-center justify-center rounded-full text-white/80 transition-all duration-150 active:scale-95"
        style={{ opacity: 0.85 }}
      >
        <Icon className={cn(iconSize, "text-white")} />
      </button>
      {label && (
        <div
          className={cn(
            "absolute z-[999] hidden group-hover/tip:block",
            tipPos[tooltipPosition],
          )}
        >
          <div className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.06] text-[11px] text-white/90 whitespace-nowrap shadow-lg pointer-events-none">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}
