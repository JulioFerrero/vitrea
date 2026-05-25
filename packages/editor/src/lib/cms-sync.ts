import { useEffect, useRef } from "react";
import { useCmsStore } from "../stores/cms-store";
import { useEditorStore } from "../stores";
import { useEditorContext } from "./context";

export function useCmsSync() {
  const { schema } = useEditorContext();
  const prevDocCache = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    const unsub = useCmsStore.subscribe((state, prev) => {
      if (state.documentCache === prev.documentCache) return;

      const elements = useEditorStore.getState().elements;
      let needsUpdate = false;

      const newDocs = new Map(state.documentCache);
      const oldDocs = prevDocCache.current;

      for (const [id, doc] of newDocs) {
        const old = oldDocs.get(id);
        if (old && JSON.stringify(old) !== JSON.stringify(doc)) {
          needsUpdate = true;
          break;
        }
        if (!old) {
          needsUpdate = true;
          break;
        }
      }

      if (!needsUpdate) return;

      prevDocCache.current = new Map(state.documentCache);

      const refFieldsByType: Record<string, string[]> = {};
      for (const et of schema.elementTypes) {
        const refs = et.fields.filter((f) => f.type === "reference").map((f) => f.name);
        if (refs.length > 0) refFieldsByType[et.type] = refs;
      }

      for (const el of elements) {
        const refFields = refFieldsByType[el.type];
        if (!refFields) continue;

        for (const field of refFields) {
          const value = el.data[field];
          if (!value) continue;
          const ids = Array.isArray(value) ? value.map(String) : [String(value)];

          for (const id of ids) {
            const cachedDoc = state.documentCache.get(id);
            if (cachedDoc && !oldDocs.has(id)) {
              useEditorStore.getState().updateElement(el.id, {} as Record<string, unknown>);
              break;
            }
          }
        }
      }
    });

    return () => unsub();
  }, [schema]);
}
