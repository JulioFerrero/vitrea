import React from "react";

export function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  elementType,
  onDragStart,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  elementType?: string;
  onDragStart?: (type: string, e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={elementType && onDragStart ? (e) => { if (e.button === 0) onDragStart(elementType, e); } : undefined}
      className="group relative flex items-center justify-center rounded-xl h-8 w-8 flex-shrink-0 text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
    >
      <Icon className="h-4 w-4" />
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover-foreground px-2 py-1 text-[10px] font-medium text-popover opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
        {label}
      </span>
    </button>
  );
}
