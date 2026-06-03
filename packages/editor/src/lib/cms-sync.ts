import { useEffect, useRef } from "react";
import { useCmsStore } from "../stores/cms-store";
import { useEditorStore } from "../stores";
import { useEditorContext } from "./context";
import { cloneTree, walkTree } from "@vitrea/render";

export function useCmsSync() {
  const { schema } = useEditorContext();
  const prevKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsub = useCmsStore.subscribe((state, prev) => {
      if (state.documentCache === prev.documentCache) return;

      const currentKeys = new Set(state.documentCache.keys());
      const addedKeys = [...currentKeys].filter((k) => !prevKeysRef.current.has(k));
      prevKeysRef.current = currentKeys;

      if (addedKeys.length === 0) return;

      const refFieldsByType: Record<string, string[]> = {};
      for (const et of schema.elementTypes) {
        const refs = et.fields.filter((f) => f.type === "reference").map((f) => f.name);
        if (refs.length > 0) refFieldsByType[et.type] = refs;
      }

      const content = useEditorStore.getState().content;
      walkTree(content, (el) => {
        const refFields = refFieldsByType[el.type];
        if (!refFields) return;
        for (const field of refFields) {
          const value = el.data[field];
          if (!value) continue;
          const ids = Array.isArray(value) ? value.map(String) : [String(value)];
          if (ids.some((id) => addedKeys.includes(id))) {
            useEditorStore.setState((editorState) => ({
              content: cloneTree(editorState.content),
            }));
            return;
          }
        }
      });
    });

    return () => unsub();
  }, [schema]);
}
