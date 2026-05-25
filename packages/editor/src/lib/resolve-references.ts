import { useRef, useEffect, useMemo, useState } from "react";
import { useCmsStore } from "../stores/cms-store";
import type { RenderElement, EditorSchema, EditorApi } from "../types";
import { createCmsActions } from "./cms-actions";

function collectReferenceFields(schema: EditorSchema): Record<string, { field: string; collection: string; multiple: boolean }[]> {
  const map: Record<string, { field: string; collection: string; multiple: boolean }[]> = {};
  for (const et of schema.elementTypes) {
    const refs = et.fields
      .filter((f) => f.type === "reference")
      .map((f) => ({ field: f.name, collection: f.collection ?? "", multiple: f.multiple ?? false }));
    if (refs.length > 0) {
      map[et.type] = refs;
    }
  }
  return map;
}

function collectAllReferenceIds(
  elements: RenderElement[],
  refMap: Record<string, { field: string; collection: string; multiple: boolean }[]>,
): Set<string> {
  const ids = new Set<string>();
  for (const el of elements) {
    const refs = refMap[el.type];
    if (!refs) continue;
    for (const ref of refs) {
      const value = el.data[ref.field];
      if (!value) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === "string") ids.add(v);
        }
      } else if (typeof value === "string") {
        ids.add(value);
      }
    }
  }
  return ids;
}

function resolveElements(
  elements: RenderElement[],
  refMap: Record<string, { field: string; collection: string; multiple: boolean }[]>,
  cache: Map<string, unknown>,
): RenderElement[] {
  return elements.map((el) => {
    const refs = refMap[el.type];
    if (!refs) return el;

    let changed = false;
    const resolvedData = { ...el.data };

    for (const ref of refs) {
      const value = el.data[ref.field];
      if (!value) continue;

      if (ref.multiple && Array.isArray(value)) {
        resolvedData[ref.field] = value
          .map((id) => cache.get(String(id)) ?? null)
          .filter(Boolean);
        changed = true;
      } else if (typeof value === "string") {
        const resolved = cache.get(value);
        if (resolved) {
          resolvedData[ref.field] = resolved;
          changed = true;
        }
      }
    }

    return changed ? { ...el, data: resolvedData } : el;
  });
}

export function useResolvedElements(
  elements: RenderElement[],
  schema: EditorSchema,
  api: EditorApi,
  _siteId: string,
): RenderElement[] {
  const refMap = useMemo(() => collectReferenceFields(schema), [schema]);
  const cacheRef = useRef<Map<string, unknown>>(new Map());
  const [resolved, setResolved] = useState<RenderElement[]>(() =>
    resolveElements(elements, refMap, cacheRef.current),
  );

  useEffect(() => {
    const allIds = collectAllReferenceIds(elements, refMap);
    const missingIds = [...allIds].filter((id) => !cacheRef.current.has(id));

    if (missingIds.length === 0) {
      setResolved(resolveElements(elements, refMap, cacheRef.current));
      return;
    }

    let cancelled = false;

    async function fetchMissing() {
      const cmsStore = useCmsStore.getState();
      const storeCached = missingIds.filter((id) => cmsStore.documentCache.has(id));
      const toFetch = missingIds.filter((id) => !cmsStore.documentCache.has(id));

      for (const id of storeCached) {
        cacheRef.current.set(id, cmsStore.documentCache.get(id));
      }

      if (toFetch.length > 0) {
        try {
          const actions = createCmsActions(api);
          const docs = await actions.loadDocumentsByIds(toFetch);
          for (const doc of docs) {
            cacheRef.current.set(doc.id, doc);
          }
        } catch {
          // Ignore fetch errors — elements will render without resolved refs
        }
      }

      if (cancelled) return;

      setResolved(resolveElements(elements, refMap, cacheRef.current));
    }

    fetchMissing();

    return () => { cancelled = true; };
  }, [elements, api, refMap]);

  useEffect(() => {
    const unsub = useCmsStore.subscribe(() => {
      const currentCache = useCmsStore.getState().documentCache;
      for (const [id, doc] of currentCache) {
        cacheRef.current.set(id, doc);
      }
      setResolved(resolveElements(elements, refMap, cacheRef.current));
    });
    return unsub;
  }, [elements, refMap]);

  return resolved;
}
