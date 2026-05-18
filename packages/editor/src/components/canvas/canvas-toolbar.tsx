import { useRef, useEffect, useState } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { getIcon } from "../../icons";
import { Minus, Plus, Maximize, ChevronUp } from "lucide-react";

interface ElementButton {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center justify-center rounded-xl h-8 w-8 flex-shrink-0 text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
    >
      <Icon className="h-4 w-4" />
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover-foreground px-2 py-1 text-[10px] font-medium text-popover opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-50">
        {label}
      </span>
    </button>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function ElementToolbar({
  pageId,
  containerSet,
}: {
  pageId: string | null;
  containerSet: Set<string>;
}) {
  const { schema, actions } = useEditorContext();
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const elements = useEditorStore((s) => s.elements);
  const containerRef = useRef<HTMLDivElement>(null);
  const [perRow, setPerRow] = useState(Infinity);
  const [expanded, setExpanded] = useState(false);

  if (!pageId) return null;

  const selected = selectedElementId
    ? elements.find((e) => e.id === selectedElementId)
    : null;
  const parentId =
    selected && containerSet.has(selected.type) ? selected.id : null;

  const allButtons: ElementButton[] = [];
  for (const et of schema.elementTypes) {
    const Ic = getIcon(et.icon);
    if (Ic) allButtons.push({ type: et.type, label: et.label, icon: Ic });
  }

  const handleClick = (type: string) =>
    actions.addElement(pageId, type, parentId);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const available = container.clientWidth;
      const btnSize = 34;
      setPerRow(Math.floor(available / btnSize));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [allButtons.length]);

  const effectivePerRow = Math.max(perRow, 1);
  const rows = effectivePerRow >= allButtons.length
    ? [allButtons]
    : [allButtons.slice(0, effectivePerRow - 1), ...chunk(allButtons.slice(effectivePerRow - 1), effectivePerRow)];
  const hasOverflow = rows.length > 1;

  return (
    <div
      ref={containerRef}
      className="flex items-end gap-1 min-w-0 flex-1 relative"
    >
      <div className="flex flex-col-reverse gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-0.5">
          {rows[0]!.map((b) => (
            <ToolbarButton
              key={b.type}
              icon={b.icon}
              label={b.label}
              onClick={() => handleClick(b.type)}
            />
          ))}
          {hasOverflow && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center rounded-xl h-8 w-8 flex-shrink-0 text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-150"
            >
              <ChevronUp
                className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {hasOverflow &&
          rows.slice(1).map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-0.5 transition-all duration-200 ease-in-out"
              style={{
                maxHeight: expanded ? 40 : 0,
                opacity: expanded ? 1 : 0,
                transitionDelay: expanded ? `${i * 50}ms` : "0ms",
              }}
            >
              {row.map((b) => (
                <ToolbarButton
                  key={b.type}
                  icon={b.icon}
                  label={b.label}
                  onClick={() => handleClick(b.type)}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export function CanvasToolbar({
  pageId,
  containerSet,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitScreen,
}: {
  pageId: string | null;
  containerSet: Set<string>;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
}) {
  return (
    <div className="flex items-end justify-between px-4 py-2 overflow-visible relative" style={{ cursor: "default" }}>
      <div className="flex items-end gap-1 rounded-2xl bg-black/80 backdrop-blur-xl p-1 shadow-[0_1px_3px_rgba(0,0,0,0.2)] min-w-0 flex-1 overflow-visible">
        <ElementToolbar pageId={pageId} containerSet={containerSet} />
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
