import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "../../stores";
import type { EditorActions } from "../../lib/actions";
import type { CursorMode } from "./canvas-cursor";
import {
  applyOutline,
  queryElementAtPoint as queryElAtPoint,
  querySelectedOutline,
} from "./canvas-helpers";
import { useInlineEditing } from "./use-inline-editing";
import { findElementById } from "@vitrea/render";

export function useBlockerEvents(
  blockerRef: React.RefObject<HTMLDivElement | null>,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  toolbarRef: React.RefObject<HTMLDivElement | null>,
  transformRef: React.RefObject<{ x: number; y: number; scale: number }>,
  isNativeDrag: React.RefObject<boolean>,
  actions: EditorActions,
  selectElement: (id: string | null) => void,
  editableTypes: Set<string>,
  applyTransform: () => void,
  setCursorMode: (m: CursorMode) => void,
) {
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastHoveredRef = useRef<HTMLElement | null>(null);
  const lastSelectedRef = useRef<HTMLElement | null>(null);

  const queryElementAtPoint = useCallback((screenX: number, screenY: number) => {
    return queryElAtPoint(wrapperRef, transformRef, screenX, screenY);
  }, [wrapperRef, transformRef]);

  const { editingRef, finishInlineEdit, handleDoubleClick } = useInlineEditing(
    actions, editableTypes, setCursorMode
  );

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
          const content = useEditorStore.getState().content;
          const clicked = findElementById(content, clickedId);
          if (clicked && clicked.children.length > 0) selectElement(clicked.children[0].id);
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
      if (isNativeDrag.current) return;
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
      handleDoubleClick(e, queryElementAtPoint);
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
  }, [queryElementAtPoint, applyTransform, selectElement, finishInlineEdit, handleDoubleClick, editableTypes]);

  useEffect(() => {
    if (lastSelectedRef.current) applyOutline(lastSelectedRef.current, "none");
    const el = querySelectedOutline(wrapperRef, useEditorStore.getState().selectedElementId);
    if (el) { applyOutline(el, "selected"); lastSelectedRef.current = el; return; }
    if (!useEditorStore.getState().selectedElementId) lastSelectedRef.current = null;
  }, [useEditorStore.getState().selectedElementId, useEditorStore.getState().content]);

  return { queryElementAtPoint, editingRef };
}
