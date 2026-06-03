import { ElementToolbar } from "./element-toolbar";
import { Minus, Plus, Maximize } from "lucide-react";
import { IconButton } from "@hi/editor-ui/icon-button";
import { Toolbar } from "@hi/editor-ui/toolbar";

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
    <div className="flex items-end justify-between px-4 overflow-visible relative" style={{ cursor: "default" }}>
      <Toolbar variant="panel" className="min-w-0 flex-1">
        <ElementToolbar pageId={pageId} containerSet={containerSet} onDragStart={onElementDragStart} />
      </Toolbar>
      <Toolbar variant="pill" className="ml-3 flex-shrink-0 mb-0.5">
        <IconButton icon={Minus} label="Zoom out" onClick={onZoomOut} tooltipPosition="top" />
        <span className="text-xs text-white tabular-nums min-w-[36px] text-center">
          {zoom}%
        </span>
        <IconButton icon={Plus} label="Zoom in" onClick={onZoomIn} tooltipPosition="top" />
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <IconButton icon={Maximize} label="Fit screen" onClick={onFitScreen} tooltipPosition="top" />
      </Toolbar>
    </div>
  );
}
