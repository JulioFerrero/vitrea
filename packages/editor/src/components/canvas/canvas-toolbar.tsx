import { ElementToolbar } from "./element-toolbar";
import { Minus, Plus, Maximize } from "lucide-react";

export function CanvasToolbar({
  pageId,
  containerSet,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onElementDragStart,
}: {
  pageId: string | null;
  containerSet: Set<string>;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onElementDragStart?: (type: string, e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <div className="flex items-end justify-between px-4 py-2 overflow-visible relative" style={{ cursor: "default" }}>
      <div className="flex items-end gap-1 rounded-2xl bg-black/80 backdrop-blur-xl p-1 shadow-[0_1px_3px_rgba(0,0,0,0.2)] min-w-0 flex-1 overflow-visible">
        <ElementToolbar pageId={pageId} containerSet={containerSet} onDragStart={onElementDragStart} />
      </div>
      <div className="flex items-center gap-0.5 rounded-2xl bg-black/80 backdrop-blur-xl px-2 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.2)] ml-2 flex-shrink-0 mb-0.5">
        <button
          type="button"
          onClick={onZoomOut}
          className="group relative flex items-center justify-center rounded-xl h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover-foreground px-2 py-1 text-[10px] font-medium text-popover opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Zoom out
          </span>
        </button>
        <span className="text-xs text-white/50 tabular-nums min-w-[36px] text-center">
          {zoom}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className="group relative flex items-center justify-center rounded-xl h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover-foreground px-2 py-1 text-[10px] font-medium text-popover opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Zoom in
          </span>
        </button>
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button
          type="button"
          onClick={onFitScreen}
          className="group relative flex items-center justify-center rounded-xl h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Maximize className="h-3.5 w-3.5" />
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover-foreground px-2 py-1 text-[10px] font-medium text-popover opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
            Fit screen
          </span>
        </button>
      </div>
    </div>
  );
}
