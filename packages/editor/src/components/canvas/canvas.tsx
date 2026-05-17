"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { useEditorStore } from "../../stores";
import type { Viewport } from "../../types";
import { useEditorContext } from "../../lib/context";
import { useDynamicCSS } from "../../lib/dynamic-css";

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useDynamicCSS(contentRef);
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastHoveredRef = useRef<HTMLElement | null>(null);
  const lastSelectedRef = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(100);

  const elements = useEditorStore((s) => s.elements);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const hoveredElementId = useEditorStore((s) => s.hoveredElementId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const activePageId = useEditorStore((s) => s.activePageId);
  const viewport = useEditorStore((s) => s.viewport);
  const { schema, actions, renderer } = useEditorContext();

  const viewportWidths: Record<Viewport, number> = { desktop: 1440, tablet: 768, mobile: 375 };
  const pageWidth = viewportWidths[viewport] ?? 1440;

  const containerTypes = schema.elementTypes.filter((t) => t.isContainer).map((t) => t.type);
  const containerSet = new Set(containerTypes);

  const editableTypes = new Set(
    schema.elementTypes
      .filter((t) => t.fields.some((f) => f.name === "content"))
      .map((t) => t.type)
  );

  const applyOutline = useCallback((el: HTMLElement | null, type: "hover" | "selected" | "none") => {
    if (!el) return;
    if (type === "none") {
      el.style.outline = "";
      el.style.outlineOffset = "";
    } else if (type === "hover") {
      el.style.outline = "1px solid rgba(129, 140, 248, 0.5)";
      el.style.outlineOffset = "-1px";
    } else {
      el.style.outline = "2px solid #818cf8";
      el.style.outlineOffset = "-1px";
    }
  }, []);

  const applyTransform = useCallback(() => {
    if (!contentRef.current) return;
    const t = transformRef.current;
    contentRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
    contentRef.current.style.transformOrigin = "0 0";
    setZoom(Math.round(t.scale * 100));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const t = transformRef.current;

    if (e.ctrlKey || e.metaKey) {
      const oldScale = t.scale;
      const factor = 1 - Math.sign(e.deltaY) * 0.005 * Math.min(Math.abs(e.deltaY), 100);
      const newScale = Math.min(Math.max(0.1, oldScale * factor), 5);
      const ratio = newScale / oldScale;
      t.x = mouseX - ratio * (mouseX - t.x);
      t.y = mouseY - ratio * (mouseY - t.y);
      t.scale = newScale;
    } else {
      t.x -= e.deltaX;
      t.y -= e.deltaY;
    }
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingRef.current) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editingRef.current) return;
        const sel = useEditorStore.getState().selectedElementId;
        if (!sel) return;
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") return;
        e.preventDefault();
        actions.deleteElement(sel);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-el-id]")) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      applyTransform();
      return;
    }

    const target = (e.target as HTMLElement).closest("[data-el-id]") as HTMLElement | null;
    if (lastHoveredRef.current && lastHoveredRef.current !== target) {
      if (lastHoveredRef.current !== lastSelectedRef.current) {
        applyOutline(lastHoveredRef.current, "none");
      }
    }
    if (target) {
      applyOutline(target, "hover");
      lastHoveredRef.current = target;
    } else {
      lastHoveredRef.current = null;
    }
  }, [applyTransform, applyOutline]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "default";
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    if (lastHoveredRef.current && lastHoveredRef.current !== lastSelectedRef.current) {
      applyOutline(lastHoveredRef.current, "none");
    }
    lastHoveredRef.current = null;
    if (containerRef.current) containerRef.current.style.cursor = "default";
  }, [applyOutline]);

  const handleZoomIn = () => {
    transformRef.current.scale = Math.min(transformRef.current.scale + 0.1, 5);
    applyTransform();
  };

  const handleZoomOut = () => {
    transformRef.current.scale = Math.max(transformRef.current.scale - 0.1, 0.1);
    applyTransform();
  };

  const handleFitScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      transformRef.current = { x: 32, y: 32, scale: 1 };
      applyTransform();
      return;
    }
    const containerW = container.clientWidth;
    const padding = 64;
    const scale = Math.min((containerW - padding) / pageWidth, 1);
    const x = (containerW - pageWidth * scale) / 2;
    transformRef.current = { x, y: 32, scale };
    applyTransform();
  }, [pageWidth, applyTransform]);

  useEffect(() => {
    handleFitScreen();
  }, [handleFitScreen]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    if (lastSelectedRef.current) {
      applyOutline(lastSelectedRef.current, "none");
    }
    if (selectedElementId) {
      const el = root.querySelector(`[data-el-id="${selectedElementId}"]`) as HTMLElement | null;
      if (el) {
        applyOutline(el, "selected");
        lastSelectedRef.current = el;
      } else {
        lastSelectedRef.current = null;
      }
    } else {
      lastSelectedRef.current = null;
    }
  }, [selectedElementId, elements, applyOutline]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    if (lastHoveredRef.current && lastHoveredRef.current !== lastSelectedRef.current) {
      applyOutline(lastHoveredRef.current, "none");
    }
    if (hoveredElementId && hoveredElementId !== selectedElementId) {
      const el = root.querySelector(`[data-el-id="${hoveredElementId}"]`) as HTMLElement | null;
      if (el) {
        applyOutline(el, "hover");
        lastHoveredRef.current = el;
      }
    } else {
      lastHoveredRef.current = null;
    }
  }, [hoveredElementId, selectedElementId, applyOutline]);

  const findFirstChild = useCallback((elementId: string): string | null => {
    const el = elements.find((e) => e.id === elementId);
    if (!el) return null;
    const child = elements.find((e) => e.parentId === elementId);
    return child?.id ?? null;
  }, [elements]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (editingRef.current) return;
    const target = (e.target as HTMLElement).closest("[data-el-id]") as HTMLElement | null;
    if (!target) {
      selectElement(null);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const clickedId = target.dataset.elId!;
    if (clickedId === selectedElementId) {
      const childId = findFirstChild(clickedId);
      if (childId) {
        selectElement(childId);
      }
    } else {
      selectElement(clickedId);
    }
  }, [selectedElementId, selectElement, findFirstChild]);

  const editingRef = useRef<HTMLElement | null>(null);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-el-id]") as HTMLElement | null;
    if (!target) return;
    const elId = target.dataset.elId!;
    const el = elements.find((e) => e.id === elId);
    if (!el) return;
    if (!editableTypes.has(el.type)) return;

    e.preventDefault();
    e.stopPropagation();
    selectElement(elId);

    target.contentEditable = "true";
    target.style.outline = "2px solid #818cf8";
    target.style.cursor = "text";
    target.focus();
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    editingRef.current = target;
  }, [elements, selectElement, editableTypes]);

  const finishInlineEdit = useCallback(() => {
    const target = editingRef.current;
    if (!target) return;
    target.contentEditable = "false";
    target.style.cursor = "";
    const elId = target.dataset.elId!;
    const newContent = target.innerText;
    actions.updateElementData(elId, { content: newContent });
    editingRef.current = null;
  }, [actions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: FocusEvent) => {
      if (editingRef.current && e.target === editingRef.current) {
        finishInlineEdit();
      }
    };
    container.addEventListener("blur", handler, true);
    return () => container.removeEventListener("blur", handler, true);
  }, [finishInlineEdit]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-editor-canvas"
        style={{ cursor: "default" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div ref={contentRef} className="absolute" style={{ willChange: "transform" }}>
          <div
            className="bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
            style={{ width: `${pageWidth}px`, minHeight: "800px", transition: "width 0.3s ease" }}
          >
            {elements.length === 0 && (
              <div className="flex h-[600px] items-center justify-center text-muted-foreground/50">
                <div className="text-center">
                  <p className="text-lg font-medium">Empty page</p>
                  <p className="mt-1 text-sm">Add elements using the toolbar below</p>
                </div>
              </div>
            )}
            <renderer.PageRenderer elements={elements} editor />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-editor-canvas">
        <div className="flex items-center gap-0.5 rounded-2xl bg-popover/80 backdrop-blur-sm p-1 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <ElementToolbar pageId={activePageId} containerSet={containerSet} />
        </div>
        <div className="flex items-center gap-0.5 rounded-2xl bg-popover/80 backdrop-blur-sm px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <button onClick={handleZoomOut} className="rounded-lg px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">−</button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[36px] text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="rounded-lg px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">+</button>
          <div className="w-px h-3 bg-border/60 mx-1" />
          <button onClick={handleFitScreen} className="rounded-lg px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Fit</button>
        </div>
      </div>
    </div>
  );
}

function ElementToolbar({ pageId, containerSet }: { pageId: string | null; containerSet: Set<string> }) {
  const { schema, actions } = useEditorContext();
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const elements = useEditorStore((s) => s.elements);
  if (!pageId) return null;

  const selected = selectedElementId ? elements.find((e) => e.id === selectedElementId) : null;
  const parentId = selected && containerSet.has(selected.type) ? selected.id : null;

  return (
    <>
      {schema.elementTypes.map((et) => {
        const Icon = et.icon;
        return (
          <button
            key={et.type}
            onClick={() => actions.addElement(pageId, et.type, parentId)}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-150"
            title={parentId ? `Add ${et.label} inside ${selected!.type}` : `Add ${et.label}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{et.label}</span>
          </button>
        );
      })}
    </>
  );
}
