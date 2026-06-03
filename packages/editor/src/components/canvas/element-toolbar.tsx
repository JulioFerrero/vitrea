import { useRef, useEffect, useState } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { getIcon } from "../../icons";
import { ChevronUp } from "lucide-react";
import { ToolbarButton } from "./toolbar-button";
import { findElementById } from "@hi/render";

interface ElementButton {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

export function ElementToolbar({
  pageId,
  containerSet,
  onDragStart,
}: {
  pageId: string | null;
  containerSet: Set<string>;
  onDragStart?: (type: string, e: React.MouseEvent<HTMLElement>) => void;
}) {
  const { schema, actions } = useEditorContext();
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const content = useEditorStore((s) => s.content);
  const containerRef = useRef<HTMLDivElement>(null);
  const [perRow, setPerRow] = useState(Infinity);
  const [expanded, setExpanded] = useState(false);

  if (!pageId) return null;

  const selected = selectedElementId
    ? findElementById(content, selectedElementId)
    : null;
  const parentId =
    selected && containerSet.has(selected.type) ? selected.id : null;

  const allButtons: ElementButton[] = [];
  for (const et of schema.elementTypes) {
    const Ic = getIcon(et.icon);
    if (Ic) allButtons.push({ type: et.type, label: et.label, icon: Ic });
  }

  const handleClick = (type: string) =>
    actions.addChild(parentId, type);
  const onToolbarDragStart = onDragStart;

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
    : [allButtons.slice(0, effectivePerRow), ...chunk(allButtons.slice(effectivePerRow), effectivePerRow)];
  const hasOverflow = rows.length > 1;

  return (
    <div
      ref={containerRef}
      className="flex items-end gap-1 min-w-0 flex-1 relative"
    >
      <div className="flex flex-col-reverse flex-1 min-w-0">
        <div className="flex items-center flex-1 min-w-0">
          {rows[0]!.map((b) => (
            <ToolbarButton
              key={b.type}
              icon={b.icon}
              label={b.label}
              elementType={b.type}
              onDragStart={onToolbarDragStart}
              onClick={() => handleClick(b.type)}
            />
          ))}
          {hasOverflow && (
            <div className="flex-1" />
          )}
          {hasOverflow && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center size-8 flex-shrink-0 text-white hover:bg-white/10 hover:text-white transition-colors duration-150 rounded-full active:scale-95"
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
              className="flex items-center gap-0.5 overflow-hidden transition-all duration-200 ease-in-out"
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
                  elementType={b.type}
                  onDragStart={onToolbarDragStart}
                  onClick={() => handleClick(b.type)}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
