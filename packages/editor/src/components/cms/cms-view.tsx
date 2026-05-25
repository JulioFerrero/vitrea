"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useCmsContext } from "../../lib/context";
import { useCmsStore } from "../../stores/cms-store";
import { createCmsActions } from "../../lib/cms-actions";
import { CollectionListSidebar } from "./collection-list";
import { DocumentList } from "./document-list";
import { DocumentEditor } from "./document-editor";

interface CmsViewProps {
  siteId: string;
  onBack: () => void;
}

function getUrlParams(): { collection?: string; filter?: Record<string, string> } | null {
  const q = globalThis.location.search;
  if (!q) return null;
  const params = new URLSearchParams(q);
  const collection = params.get("collection");
  if (!collection) return null;
  const filter: Record<string, string> = {};
  params.forEach((v, k) => {
    if (k.startsWith("filter[")) {
      const field = k.slice(7, -1);
      filter[field] = v;
    }
  });
  return { collection, filter: Object.keys(filter).length > 0 ? filter : undefined };
}

function setUrlParams(collection: string | null, filter: Record<string, string> | null) {
  const url = new URL(globalThis.location.href);
  url.search = "";
  if (collection) {
    url.searchParams.set("collection", collection);
    if (filter) {
      for (const [k, v] of Object.entries(filter)) {
        url.searchParams.set(`filter[${k}]`, v);
      }
    }
  }
  globalThis.history.replaceState({}, "", url.toString());
}

export function CmsView({ siteId, onBack }: CmsViewProps) {
  const { api, schema } = useCmsContext();
  const actions = useMemo(() => createCmsActions(api), [api]);
  const initRef = useRef(false);
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevFilterRef = useRef<Record<string, string> | null>(null);
  const urlRestoredRef = useRef(false);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCollection = useCmsStore((s) => s.selectedCollection);
  const editingDocument = useCmsStore((s) => s.editingDocument);
  const structureFilter = useCmsStore((s) => s.structureFilter);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      try {
        let cols = useCmsStore.getState().collections;
        if (cols.length === 0) {
          cols = await actions.loadCollections(siteId);
        }
        if (schema) {
          if (schema.structure) {
            useCmsStore.getState().setStructure(schema.structure);
          }
          await actions.seedCollections(siteId, schema);
          cols = await actions.loadCollections(siteId);
        }
        setLoaded(true);

        const urlParams = getUrlParams();
        if (urlParams?.collection && !urlRestoredRef.current) {
          urlRestoredRef.current = true;
          const col = useCmsStore.getState().collections.find(
            (c: { name: string }) => c.name === urlParams.collection,
          );
          if (col) {
            if (urlParams.filter) {
              useCmsStore.getState().setStructureFilter(urlParams.filter);
            }
            useCmsStore.getState().selectCollection(col);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      }
    }
    init();
  }, [siteId]);

  useEffect(() => {
    if (!selectedCollection) {
      prevSelectedIdRef.current = null;
      prevFilterRef.current = null;
      setUrlParams(null, null);
      return;
    }
    if (selectedCollection.id === prevSelectedIdRef.current &&
        JSON.stringify(structureFilter) === JSON.stringify(prevFilterRef.current)) {
      return;
    }
    prevSelectedIdRef.current = selectedCollection.id;
    prevFilterRef.current = structureFilter;
    setUrlParams(selectedCollection.name, structureFilter);

    const selectFields = new Set<string>();
    const fields = selectedCollection.fields;
    const titleField = fields.find((f: { name: string; type: string }) => f.name === "title" || f.name === "name");
    if (titleField) selectFields.add(titleField.name);
    else {
      const firstText = fields.find((f: { type: string }) => f.type === "text" || f.type === "textarea");
      if (firstText) selectFields.add(firstText.name);
    }
    const subtitleField = fields.find((f: { name: string }) => f.name === "subtitle");
    if (subtitleField) selectFields.add(subtitleField.name);

    actions.loadDocuments(selectedCollection.id, selectedCollection.name, structureFilter ?? undefined, [...selectFields]).catch(() => {});
  }, [selectedCollection?.id, structureFilter, actions]);

  const breadcrumb = useMemo(() => {
    if (!selectedCollection) return null;
    if (!schema?.structure) return selectedCollection.label;
    const parts: string[] = [];
    function walk(items: any[]): boolean {
      for (const item of items) {
        if (item.type === "collection" && item.collection === selectedCollection?.name) {
          const filterMatch = !item.filter ||
            (structureFilter && JSON.stringify(item.filter) === JSON.stringify(structureFilter));
          if (filterMatch) {
            if (item.title) parts.push(item.title);
            return true;
          }
        }
        if (item.type === "list" && item.items) {
          const startLen = parts.length;
          parts.push(item.title);
          if (walk(item.items)) return true;
          parts.length = startLen;
        }
      }
      return false;
    }
    walk(schema.structure);
    return parts.length > 0 ? parts.join(" / ") : selectedCollection.label;
  }, [selectedCollection, structureFilter, schema?.structure]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-sm text-destructive">Failed to load content</p>
        <p className="text-[11px] text-white/40">{error}</p>
        <button type="button" onClick={onBack} className="text-xs text-editor-ring hover:text-white/80 transition-colors">
          &larr; Back to Editor
        </button>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-white/40">Loading content...</p>
      </div>
    );
  }

  if (editingDocument) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-3 h-14 px-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
          <button type="button" onClick={() => useCmsStore.getState().setEditingDocument(null)}
            className="flex h-9 items-center justify-center rounded-xl px-3 text-sm text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/80">
            &larr; Back
          </button>
          <span className="text-sm font-medium text-white/80">Editing: {selectedCollection?.label ?? "Document"}</span>
        </div>
        <div className="flex-1 overflow-auto editor-scroll">
          <DocumentEditor document={editingDocument} collection={selectedCollection} siteId={siteId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center gap-3 h-14 px-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <button type="button" onClick={onBack}
          className="flex h-9 items-center justify-center rounded-xl px-3 text-sm text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/80">
          &larr; Back to Editor
        </button>
        <span className="text-sm font-semibold text-white/80">Content</span>
        {breadcrumb && (
          <>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/50">{breadcrumb}</span>
          </>
        )}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <CollectionListSidebar />
        <div className="flex-1 overflow-auto editor-scroll">
          {selectedCollection ? (
            <DocumentList collection={selectedCollection} siteId={siteId} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-[11px] text-white/40">Select a collection to view its documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
