"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { CanvasToolbar } from "./canvas-toolbar";
import { CanvasCursor, type CursorMode } from "./canvas-cursor";
import { ViewportFrame, getTotalWidth } from "./viewport-frame";
import type { Viewport } from "../../types";

const VIEWPORTS: Viewport[] = ["desktop", "tablet", "mobile"];

function applyOutline(el: HTMLElement | null, type: "hover" | "selected" | "none") {
  if (!el) return;
  if (type === "none") { el.style.outline = ""; el.style.outlineOffset = ""; }
  else if (type === "hover") { el.style.outline = "1px solid rgba(129, 140, 248, 0.5)"; el.style.outlineOffset = "-1px"; }
  else { el.style.outline = "2px solid #818cf8"; el.style.outlineOffset = "-1px"; }
}

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const blockerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastHoveredRef = useRef<HTMLElement | null>(null);
  const lastSelectedRef = useRef<HTMLElement | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);

  const [zoom, setZoom] = useState(100);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorVisible, setCursorVisible] = useState(true);

  const elements = useEditorStore((s) => s.elements);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const activePageId = useEditorStore((s) => s.activePageId);
  const { schema, actions, renderer } = useEditorContext();

  const editableTypes = new Set(schema.elementTypes.filter((t) => t.fields.some((f) => f.name === "content")).map((t) => t.type));
  const containerSet = new Set(schema.elementTypes.filter((t) => t.isContainer).map((t) => t.type));

  const totalWidth = getTotalWidth();

  const applyTransform = useCallback(() => {
    if (!wrapperRef.current) return;
    const t = transformRef.current;
    wrapperRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
    wrapperRef.current.style.transformOrigin = "0 0";
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
    } else { t.x -= e.deltaX; t.y -= e.deltaY; }
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleFitScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) { transformRef.current = { x: 32, y: 32, scale: 0.3 }; applyTransform(); return; }
    const containerW = container.clientWidth;
    const padding = 64;
    const scale = Math.min((containerW - padding) / totalWidth, 1);
    const x = (containerW - totalWidth * scale) / 2;
    transformRef.current = { x, y: 32, scale };
    applyTransform();
  }, [totalWidth, applyTransform]);

  useEffect(() => { handleFitScreen(); }, [handleFitScreen]);

  const queryElementAtPoint = useCallback((screenX: number, screenY: number): { el: HTMLElement } | null => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return null;
    const iframes = Array.from(wrapper.querySelectorAll("iframe"));
    const t = transformRef.current;
    for (const iframe of iframes) {
      const rect = iframe.getBoundingClientRect();
      const px = (screenX - rect.left) / t.scale;
      const py = (screenY - rect.top) / t.scale;
      const doc = iframe.contentDocument;
      if (!doc) continue;
      const hit = doc.elementFromPoint(px, py)?.closest("[data-el-id]") as HTMLElement | null;
      if (hit) return { el: hit };
    }
    return null;
  }, []);

  const finishInlineEdit = useCallback(() => {
    const target = editingRef.current;
    if (!target) return;
    target.contentEditable = "false";
    target.style.cursor = "";
    const elId = target.getAttribute("data-el-id")!;
    actions.updateElementData(elId, { content: target.innerText });
    editingRef.current = null;
    setCursorMode("default");
  }, [actions]);

  const startInlineEdit = useCallback((target: HTMLElement) => {
    target.contentEditable = "true";
    target.style.outline = "2px solid #818cf8";
    target.style.cursor = "text";
    target.focus();
    const doc = target.ownerDocument;
    const win = doc.defaultView;
    if (win) {
      const range = doc.createRange();
      range.selectNodeContents(target);
      const sel = win.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    editingRef.current = target;
    setCursorMode("text");
  }, []);

  useEffect(() => {
    const blocker = blockerRef.current;
    if (!blocker) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const hit = queryElementAtPoint(e.clientX, e.clientY);
      if (hit) {
        if (editingRef.current && editingRef.current !== hit.el) finishInlineEdit();
        const clickedId = hit.el.getAttribute("data-el-id")!;
        if (clickedId === useEditorStore.getState().selectedElementId) {
          const elems = useEditorStore.getState().elements;
          const child = elems.find((c) => c.parentId === clickedId);
          if (child) selectElement(child.id);
        } else { selectElement(clickedId); }
        return;
      }
      if (editingRef.current) finishInlineEdit();
      selectElement(null);
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      blocker.style.cursor = "none";
      setCursorMode("grabbing");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return;
      if (isDragging.current) {
        transformRef.current.x += e.clientX - lastMouse.current.x;
        transformRef.current.y += e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        applyTransform();
        return;
      }
      if (editingRef.current) return;
      const hit = queryElementAtPoint(e.clientX, e.clientY);
      if (lastHoveredRef.current && lastHoveredRef.current !== hit?.el) {
        if (lastHoveredRef.current !== lastSelectedRef.current) applyOutline(lastHoveredRef.current, "none");
      }
      if (hit) {
        applyOutline(hit.el, "hover");
        lastHoveredRef.current = hit.el;
        setCursorMode("hover");
      } else {
        lastHoveredRef.current = null;
        setCursorMode("default");
      }
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setCursorMode("default");
      }
    };

    const onDblClick = (e: MouseEvent) => {
      const hit = queryElementAtPoint(e.clientX, e.clientY);
      if (!hit) return;
      const elId = hit.el.getAttribute("data-el-id")!;
      const el = useEditorStore.getState().elements.find((e) => e.id === elId);
      if (!el || !editableTypes.has(el.type)) return;
      selectElement(elId);
      startInlineEdit(hit.el);
    };

    blocker.addEventListener("mousedown", onMouseDown);
    blocker.addEventListener("dblclick", onDblClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      blocker.removeEventListener("mousedown", onMouseDown);
      blocker.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [queryElementAtPoint, applyTransform, selectElement, finishInlineEdit, startInlineEdit, editableTypes]);

  useKeyboardShortcuts(actions, editingRef);

  useEffect(() => {
    if (lastSelectedRef.current) applyOutline(lastSelectedRef.current, "none");
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const docs = Array.from(wrapper.querySelectorAll("iframe")).map((f) => f.contentDocument).filter(Boolean) as Document[];
    for (const doc of docs) {
      if (selectedElementId) {
        const el = doc.querySelector(`[data-el-id="${selectedElementId}"]`) as HTMLElement | null;
        if (el) { applyOutline(el, "selected"); lastSelectedRef.current = el; return; }
      }
    }
    if (!selectedElementId) lastSelectedRef.current = null;
  }, [selectedElementId, elements]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-editor-canvas" style={{ cursor: "none" }}>
        <div ref={wrapperRef} className="absolute" style={{ willChange: "transform" }}>
          <div className="relative">
            <div className="flex items-start gap-12 p-8">
              {VIEWPORTS.map((vp) => (
                <ViewportFrame key={vp} viewport={vp} elements={elements} renderer={renderer} />
              ))}
            </div>
            <div
              ref={blockerRef}
              className="absolute inset-0"
              style={{ zIndex: 10, cursor: "none" }}
            />
          </div>
        </div>
        <CanvasCursor containerRef={containerRef} mode={cursorMode} name="Julio" color="#7B61FF" visible={cursorVisible} />
        <div ref={toolbarRef} className="absolute bottom-0 left-[240px] right-[240px] z-20 pointer-events-auto" style={{ cursor: "default" }} onMouseEnter={() => setCursorVisible(false)} onMouseLeave={() => setCursorVisible(true)}>
          <CanvasToolbar
            pageId={activePageId}
            containerSet={containerSet}
            zoom={zoom}
            onZoomIn={() => { transformRef.current.scale = Math.min(transformRef.current.scale + 0.1, 5); applyTransform(); }}
            onZoomOut={() => { transformRef.current.scale = Math.max(transformRef.current.scale - 0.1, 0.1); applyTransform(); }}
            onFitScreen={handleFitScreen}
          />
        </div>
      </div>
    </div>
  );
}
