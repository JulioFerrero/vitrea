import React from "react";

export function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  elementType,
  onDragStart,
  shortcut,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  elementType?: string;
  onDragStart?: (type: string, e: React.MouseEvent<HTMLElement>) => void;
  shortcut?: string;
}) {
  return (
    <div className="relative group/tip hover:z-[200]">
      <button
        type="button"
        onClick={onClick}
        onMouseDown={elementType && onDragStart ? (e) => { if (e.button === 0) onDragStart(elementType, e); } : undefined}
        className="size-8 hover:bg-white/10 flex items-center text-white duration-200 active:scale-95 justify-center cursor-pointer rounded-full"
        style={{ opacity: 0.85 }}
      >
        <Icon className="h-4 w-4" />
      </button>
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 whitespace-nowrap z-[200]">
        <div className="bg-black/80 backdrop-blur-sm text-white text-[11px] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
          <span>{label}</span>
          {shortcut && <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-[9px] font-mono">{shortcut}</kbd>}
        </div>
      </div>
    </div>
  );
}
