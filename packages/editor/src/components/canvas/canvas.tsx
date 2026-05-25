"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { usePanZoom } from "./use-pan-zoom";
import { useBlockerEvents } from "./use-blocker-events";
import { useElementDrop } from "./use-element-drop";
import { CanvasToolbar } from "./canvas-toolbar";
import { CanvasCursor, type CursorMode } from "./canvas-cursor";
import { ViewportFrame } from "./viewport-frame";
import { useResolvedElements } from "../../lib/resolve-references";
import type { Viewport } from "../../types";

const VIEWPORTS: Viewport[] = ["desktop", "tablet", "mobile"];

export function Canvas({ leftPanelOpen, rightPanelOpen }: { leftPanelOpen: boolean; rightPanelOpen: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const blockerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isNativeDrag = useRef(false);

  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorVisible, setCursorVisible] = useState(true);

  const elements = useEditorStore((s) => s.elements);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const activePageId = useEditorStore((s) => s.activePageId);
  const activeSiteId = useEditorStore((s) => s.activeSiteId);
  const { schema, actions, renderer, api } = useEditorContext();

  const resolvedElements = useResolvedElements(elements, schema, api, activeSiteId ?? "");

  const editableTypes = new Set(schema.elementTypes.filter((t) => t.fields.some((f) => f.name === "content")).map((t) => t.type));
  const containerSet = new Set(schema.elementTypes.filter((t) => t.isContainer).map((t) => t.type));

  const { transformRef, zoom, applyTransform, handleFitScreen } = usePanZoom(containerRef, wrapperRef);
  const { queryElementAtPoint, editingRef } = useBlockerEvents(blockerRef, wrapperRef, toolbarRef, transformRef, isNativeDrag, actions, selectElement, editableTypes, applyTransform, setCursorMode);
  const { dragLabel, handleDragStart } = useElementDrop(queryElementAtPoint, isNativeDrag, containerSet, activePageId, actions);

  useKeyboardShortcuts(actions, editingRef);

  const handleElementDragStart = (type: string, e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const config = schema.elementTypes.find((t) => t.type === type);
    handleDragStart(type, config?.label ?? type);
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-editor-canvas" style={{ cursor: "none" }}>
        <div ref={wrapperRef} className="absolute" style={{ willChange: "transform" }}>
          <div className="relative">
            <div className="flex items-start gap-12 p-8">
              {VIEWPORTS.map((vp) => (
                <ViewportFrame key={vp} viewport={vp} elements={resolvedElements} renderer={renderer} />
              ))}
            </div>
            <div
              ref={blockerRef}
              className="absolute inset-0"
              style={{ zIndex: 10, cursor: "none" }}
            />
          </div>
        </div>
        <CanvasCursor containerRef={containerRef} mode={cursorMode} name="Julio" color="#7B61FF" visible={cursorVisible} dragLabel={dragLabel} />
        <div ref={toolbarRef} className="absolute bottom-0 z-20 pointer-events-auto transition-all duration-200 ease-in-out" style={{ cursor: "default", left: leftPanelOpen ? 240 : 0, right: rightPanelOpen ? 240 : 0 }} onMouseEnter={() => setCursorVisible(false)} onMouseLeave={() => setCursorVisible(true)}>
          <CanvasToolbar
            pageId={activePageId}
            containerSet={containerSet}
            zoom={zoom}
            onZoomIn={() => { transformRef.current.scale = Math.min(transformRef.current.scale + 0.1, 5); applyTransform(); }}
            onZoomOut={() => { transformRef.current.scale = Math.max(transformRef.current.scale - 0.1, 0.1); applyTransform(); }}
            onFitScreen={handleFitScreen}
            onElementDragStart={handleElementDragStart}
          />
        </div>
      </div>
    </div>
  );
}
