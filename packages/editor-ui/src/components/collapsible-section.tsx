"use client";

import { useState } from "react";
import { cn } from "@hi/utils";
import { ChevronRight } from "lucide-react";

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = onToggle ?? (() => setInternalOpen(!internalOpen));

  const header = (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
    >
      <ChevronRight
        className={cn(
          "h-3 w-3 text-white transition-transform duration-150 flex-shrink-0",
          open && "rotate-90"
        )}
      />
      {Icon && <Icon className="h-3 w-3 text-white flex-shrink-0" />}
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90">{title}</span>
    </button>
  );

  if (!children) return <div>{header}</div>;

  return (
    <div>
      {header}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-150 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
