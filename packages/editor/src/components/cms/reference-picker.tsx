"use client";

import { useState, useEffect, useMemo } from "react";
import { useCmsContext } from "../../lib/context";
import { createCmsActions } from "../../lib/cms-actions";
import { useCmsStore, type CmsDocumentItem } from "../../stores/cms-store";
import { Modal } from "@hi/editor-ui/modal";
import { Button } from "@hi/editor-ui/form-primitives";
import { SearchInput } from "@hi/editor-ui/search-input";
import { Spinner } from "@hi/editor-ui/spinner";
import { EmptyState } from "@hi/editor-ui/empty-state";

interface ReferencePickerProps {
  collection: string;
  selectedIds: string[];
  multiple: boolean;
  siteId: string;
  onChange: (ids: string[]) => void;
}

export function ReferencePicker({
  collection,
  selectedIds,
  multiple,
  siteId,
  onChange,
}: ReferencePickerProps) {
  const { api } = useCmsContext();
  const actions = useMemo(() => createCmsActions(api), [api]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchDocs, setSearchDocs] = useState<CmsDocumentItem[]>([]);
  const [localIds, setLocalIds] = useState<string[]>(selectedIds);
  const [search, setSearch] = useState("");

  const documentCache = useCmsStore((s) => s.documentCache);
  const selectedDocs = localIds
    .map((id) => documentCache.get(id))
    .filter(Boolean) as CmsDocumentItem[];

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      if (collection) {
        let cols = useCmsStore.getState().collections;
        if (cols.length === 0 && siteId) {
          await actions.loadCollections(siteId);
          cols = useCmsStore.getState().collections;
        }
        const col = cols.find((c) => c.name === collection);
        if (col) {
          const docs = await actions.loadDocuments(col.id, col.name);
          setSearchDocs(docs);
        }
      }
      setLoading(false);
    }
    load();
  }, [open, collection, actions, siteId]);

  const filteredDocs = search
    ? searchDocs.filter((doc) => {
        const data = doc.data as Record<string, unknown>;
        return JSON.stringify(data).toLowerCase().includes(search.toLowerCase());
      })
    : searchDocs;

  function handleToggle(id: string) {
    if (multiple) {
      setLocalIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setLocalIds((prev) => (prev[0] === id ? [] : [id]));
    }
  }

  function handleConfirm() {
    onChange(localIds);
    setOpen(false);
  }

  function handleRemove(id: string) {
    const filtered = selectedIds.filter((i) => i !== id);
    onChange(filtered);
    setLocalIds(filtered);
  }

  if (!open) {
    return (
      <div>
        {selectedDocs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {selectedDocs.map((doc) => {
              const data = doc.data as Record<string, unknown>;
              const title = (data.title ?? data.name ?? "Untitled") as string;
              return (
                <span
                  key={doc.id}
                  className="inline-flex items-center gap-1 text-[11px] bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-lg"
                >
                  {title}
                  <button
                    type="button"
                    onClick={() => handleRemove(doc.id)}
                    className="text-white/20 hover:text-destructive transition-colors"
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 text-left cursor-pointer hover:border-white/20 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-all duration-200"
        >
          {selectedDocs.length > 0
            ? `${selectedDocs.length} selected`
            : `Select ${collection}...`}
        </button>
      </div>
    );
  }

  return (
    <Modal open={open} onOpenChange={setOpen} variant="flat" maxWidth="max-w-lg" className="max-h-[80vh] flex flex-col">
      <h2 className="text-base font-semibold text-white tracking-tight">Select {collection}</h2>

      <div className="mt-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
      </div>

      <div className="flex-1 overflow-y-auto editor-scroll mt-3 -mx-6 px-6">
        {loading ? (
          <Spinner />
        ) : filteredDocs.length === 0 ? (
          <EmptyState title="No documents found" />
        ) : (
          filteredDocs.map((doc) => {
            const data = doc.data as Record<string, unknown>;
            const title = (data.title ?? data.name ?? "Untitled") as string;
            const isSelected = localIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => handleToggle(doc.id)}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all duration-200 border-b border-white/[0.04] ${
                  isSelected
                    ? "bg-editor-selected text-editor-ring"
                    : "hover:bg-white/[0.03] text-white/70"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isSelected
                      ? "bg-editor-ring border-editor-ring"
                      : "border-white/20"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5l2 2 4-4" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{title}</p>
                  <p className="text-[11px] text-white/30 font-mono">{doc.id}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-white/[0.06]">
        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
