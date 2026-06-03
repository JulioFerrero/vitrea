import { useRef, useEffect, useCallback, useState } from "react";
import { useEditorStore } from "../../stores";
import { findElementById, findById } from "@vitrea/render";

export function useElementDrop(
  queryElementAtPoint: (x: number, y: number) => { el: HTMLElement } | null,
  isNativeDrag: React.RefObject<boolean>,
  containerSet: Set<string>,
  activePageId: string | null,
  actions: any,
) {
  const dragTypeRef = useRef<string | null>(null);
  const dropIndicatorElRef = useRef<HTMLElement | null>(null);
  const dropInfoRef = useRef<{ parentId: string | null; index: number }>({ parentId: null, index: 0 });

  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const [dragConfig, setDragConfig] = useState<{ type: string; label: string } | null>(null);

  const clearDropIndicator = useCallback(() => {
    const el = dropIndicatorElRef.current;
    if (el && el.parentNode) el.parentNode.removeChild(el);
    dropIndicatorElRef.current = null;
    dropInfoRef.current = { parentId: null, index: 0 };
  }, []);

  const showLineIndicator = useCallback((doc: Document, targetEl: HTMLElement, before: boolean) => {
    clearDropIndicator();
    const wrapper = doc.createElement("div");
    const rect = targetEl.getBoundingClientRect();
    const top = before ? rect.top - 2 : rect.bottom - 1;
    wrapper.style.cssText = `position:fixed;left:${rect.left}px;top:${top}px;width:${rect.width}px;height:3px;display:flex;align-items:center;justify-content:center;z-index:99999;pointer-events:none;`;

    const line = doc.createElement("div");
    line.style.cssText = `position:absolute;left:0;right:0;top:50%;height:3px;background:#818cf8;border-radius:2px;box-shadow:0 0 8px rgba(129,140,248,0.6);`;
    wrapper.appendChild(line);

    if (dragConfig) {
      const label = doc.createElement("div");
      label.style.cssText = `position:relative;padding:3px 10px;background:#818cf8;color:#fff;font-size:11px;font-weight:600;font-family:Inter,system-ui,sans-serif;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.2);`;
      label.textContent = dragConfig.label;
      wrapper.appendChild(label);
    }

    doc.body.appendChild(wrapper);
    dropIndicatorElRef.current = wrapper;
  }, [clearDropIndicator, dragConfig]);

  const showContainerIndicator = useCallback((doc: Document, containerEl: HTMLElement) => {
    clearDropIndicator();
    const wrapper = doc.createElement("div");
    const rect = containerEl.getBoundingClientRect();
    wrapper.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border:2px dashed #818cf8;border-radius:4px;background:rgba(129,140,248,0.06);z-index:99999;pointer-events:none;display:flex;align-items:center;justify-content:center;`;

    if (dragConfig) {
      const label = doc.createElement("div");
      label.style.cssText = `padding:4px 12px;background:#818cf8;color:#fff;font-size:11px;font-weight:600;font-family:Inter,system-ui,sans-serif;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.2);`;
      label.textContent = dragConfig.label;
      wrapper.appendChild(label);
    }

    doc.body.appendChild(wrapper);
    dropIndicatorElRef.current = wrapper;
  }, [clearDropIndicator, dragConfig]);

  const handleDragStart = useCallback((type: string, label: string) => {
    dragTypeRef.current = type;
    isNativeDrag.current = true;
    setDragLabel(label);
    setDragConfig({ type, label });
  }, [isNativeDrag]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragTypeRef.current) return;
      const hit = queryElementAtPoint(e.clientX, e.clientY);
      if (!hit) { clearDropIndicator(); return; }

      const hitId = hit.el.getAttribute("data-el-id")!;
      const content = useEditorStore.getState().content;
      const hitEl = findElementById(content, hitId);
      if (!hitEl) { clearDropIndicator(); return; }

      const doc = hit.el.ownerDocument;
      const rect = hit.el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const before = e.clientY < midY;
      const isContainer = containerSet.has(hitEl.type);

      if (isContainer && hitEl.children.length === 0) {
        showContainerIndicator(doc, hit.el);
        dropInfoRef.current = { parentId: hitId, index: 0 };
      } else {
        showLineIndicator(doc, hit.el, before);
        const hitParentInfo = findById(content, hitId);
        const parent = hitParentInfo?.parent;
        const siblings = parent ? parent.children : content;
        const idx = siblings.findIndex((s) => s.id === hitId);
        dropInfoRef.current = { parentId: parent?.id ?? null, index: before ? idx : idx + 1 };
      }
    };

    const onUp = (e: MouseEvent) => {
      if (!dragTypeRef.current) return;
      const type = dragTypeRef.current;
      dragTypeRef.current = null;
      isNativeDrag.current = false;
      setDragLabel(null);
      setDragConfig(null);

      const { parentId, index } = dropInfoRef.current;
      clearDropIndicator();

      if (!activePageId) return;

      actions.addChild(parentId, type, index).then((el: any) => {
        actions.moveNodeTo(el.id, parentId, index);
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [queryElementAtPoint, showLineIndicator, showContainerIndicator, clearDropIndicator, activePageId, actions, containerSet]);

  return { dragLabel, handleDragStart };
}
