import { useRef, useCallback } from "react";
import type { EditorActions } from "../../lib/actions";
import type { CursorMode } from "./canvas-cursor";
import { useEditorStore } from "../../stores";
import { findElementById } from "@vitrea/render";

export function useInlineEditing(
  actions: EditorActions,
  editableTypes: Set<string>,
  setCursorMode: (m: CursorMode) => void
) {
  const editingRef = useRef<HTMLElement | null>(null);

  const finishInlineEdit = useCallback(() => {
    const target = editingRef.current;
    if (!target) return;
    target.contentEditable = "false";
    target.style.cursor = "";
    if (target.isConnected) {
      const elId = target.getAttribute("data-el-id")!;
      actions.updateNodeData(elId, { content: target.innerText });
    }
    editingRef.current = null;
    setCursorMode("default");
  }, [actions, setCursorMode]);

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
  }, [setCursorMode]);

  const handleDoubleClick = useCallback((e: MouseEvent, queryElAtPoint: (x: number, y: number) => { el: HTMLElement } | null) => {
    const hit = queryElAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    const elId = hit.el.getAttribute("data-el-id")!;
    const content = useEditorStore.getState().content;
    const el = findElementById(content, elId);
    if (!el || !editableTypes.has(el.type)) return;
    useEditorStore.getState().selectElement(elId);
    startInlineEdit(hit.el);
  }, [editableTypes, startInlineEdit]);

  return { editingRef, finishInlineEdit, startInlineEdit, handleDoubleClick };
}
