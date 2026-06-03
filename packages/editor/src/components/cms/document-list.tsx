"use client";

import { useMemo } from "react";
import { useCmsStore, type CmsCollectionItem } from "../../stores/cms-store";
import { useCmsContext } from "../../lib/context";
import { createCmsActions } from "../../lib/cms-actions";
import { Spinner } from "@vitrea/editor-ui/spinner";
import { EmptyState } from "@vitrea/editor-ui/empty-state";

interface DocumentListProps {
  collection: CmsCollectionItem;
  siteId: string;
}

export function DocumentList({ collection, siteId }: DocumentListProps) {
  const { api } = useCmsContext();
  const actions = useMemo(() => createCmsActions(api), [api]);
  const structureFilter = useCmsStore((s) => s.structureFilter);
  const rawDocs = useCmsStore((s) => s.documentsByCollection[structureFilter ? `${collection.name}::${JSON.stringify(structureFilter)}` : collection.name]);
  const documents = rawDocs ?? [];
  const isLoading = useCmsStore((s) => s.isLoading);

  async function handleCreate() {
    const doc = await actions.createDocument(collection.id, siteId, {});
    useCmsStore.getState().setEditingDocument(doc);
  }

  async function handleEdit(doc: (typeof documents)[number]) {
    const full = await actions.loadFullDocument(doc.id);
    useCmsStore.getState().setEditingDocument(full);
  }

  async function handleDelete(doc: (typeof documents)[number]) {
    const title = findTitle(doc.data, collection);
    if (!confirm(`Delete "${title}"?`)) return;
    await actions.deleteDocument(doc.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{collection.label}</h2>
        <button
          type="button"
          onClick={handleCreate}
          className="flex h-8 items-center rounded-xl px-3 text-xs font-medium text-white/80 bg-white/10 transition-all duration-200 hover:bg-white/[0.15] hover:text-white"
        >
          + New
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && documents.length === 0 && (
        <EmptyState
          title={`No ${collection.label.toLowerCase()}s yet`}
          action={{
            label: `Create your first ${collection.label.toLowerCase()}`,
            onClick: handleCreate,
          }}
        />
      )}

      {!isLoading && documents.length > 0 && (
        <div>
          {documents.map((doc) => {
            const title = findTitle(doc.data, collection);
            const subtitle = findSubtitle(doc.data, collection);
            return (
              <div
                key={doc.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-editor-selected/50 cursor-pointer transition-colors border-b border-white/[0.04]"
                onClick={() => handleEdit(doc)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80 truncate">{title}</p>
                  {subtitle && (
                    <p className="text-[11px] text-white/40 truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                      doc.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {doc.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-white hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white">
                      <path d="M3 3.5l6 6M9 3.5l-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function findTitle(data: Record<string, unknown>, collection: CmsCollectionItem): string {
  const titleField = collection.fields.find((f) => f.name === "title" || f.name === "name");
  if (titleField) return String(data[titleField.name] ?? "Untitled");
  const firstText = collection.fields.find((f) => f.type === "text");
  if (firstText) return String(data[firstText.name] ?? "Untitled");
  return "Untitled";
}

function findSubtitle(data: Record<string, unknown>, collection: CmsCollectionItem): string | null {
  const subtitleField = collection.fields.find((f) => f.name === "subtitle");
  if (subtitleField) return String(data[subtitleField.name] ?? "");
  return null;
}
