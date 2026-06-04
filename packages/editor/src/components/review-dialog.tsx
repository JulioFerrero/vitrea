"use client";

import { useState, useEffect, useMemo } from "react";
import { useEditorStore } from "../stores";
import { useEditorContext } from "../lib/context";
import { useCmsStore } from "../stores/cms-store";
import { Modal } from "@vitrea/editor-ui/modal";
import { Button, Badge } from "@vitrea/editor-ui/form-primitives";
import { Spinner } from "@vitrea/editor-ui/spinner";
import { EmptyState } from "@vitrea/editor-ui/empty-state";
import { ScrollArea } from "@vitrea/editor-ui/scroll-area";
import { Plus, Pencil, Upload, Loader2 } from "lucide-react";
import type { RenderElement } from "../types";

interface DiffData {
  draft: RenderElement[];
  published: RenderElement[];
  changes: {
    added: number;
    modified: number;
    addedElements: RenderElement[];
    modifiedElements: RenderElement[];
  };
}

function resolveName(id: string, cache: Map<string, unknown>): string {
  const doc = cache.get(id) as Record<string, unknown> | undefined;
  if (!doc) return id;
  const data = doc.data as Record<string, unknown> | undefined;
  return (data?.name || data?.title || data?.label || id) as string;
}

function getArrayDiffs(
  oldArr: unknown[],
  newArr: unknown[],
  cache: Map<string, unknown>,
): { added: string[]; removed: string[] } {
  const oldSet = new Set(oldArr.map((v) => String(v)));
  const newSet = new Set(newArr.map((v) => String(v)));
  return {
    added: [...newSet].filter((v) => !oldSet.has(v)).map((v) => resolveName(v, cache)),
    removed: [...oldSet].filter((v) => !newSet.has(v)).map((v) => resolveName(v, cache)),
  };
}

function getFieldChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  cache: Map<string, unknown>,
): Array<{ key: string; type: "scalar" | "array"; oldVal: string; newVal: string; added: string[]; removed: string[] }> {
  const results: ReturnType<typeof getFieldChanges> = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    const oldVal = oldData[key];
    const newVal = newData[key];
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      const diffs = getArrayDiffs(oldVal, newVal, cache);
      results.push({ key, type: "array", oldVal: "", newVal: "", ...diffs });
    } else if (Array.isArray(oldVal) || Array.isArray(newVal)) {
      const strOld = Array.isArray(oldVal) ? (oldVal as unknown[]).map((v) => resolveName(String(v), cache)).join(", ") : String(oldVal ?? "");
      const strNew = Array.isArray(newVal) ? (newVal as unknown[]).map((v) => resolveName(String(v), cache)).join(", ") : String(newVal ?? "");
      results.push({ key, type: "scalar", oldVal: strOld, newVal: strNew, added: [], removed: [] });
    } else {
      results.push({
        key,
        type: "scalar",
        oldVal: String(oldVal ?? ""),
        newVal: String(newVal ?? ""),
        added: [],
        removed: [],
      });
    }
  }

  return results;
}

function ElementTree({ elements }: { elements: RenderElement[] }) {
  if (elements.length === 0) return null;

  return (
    <ul className="ml-4 border-l border-white/10 pl-3">
      {elements.map((el) => (
        <li key={el.id} className="py-0.5">
          <span className="text-xs text-white/50">{el.type}</span>
          <span className="text-xs text-white/80 ml-2">
            {(el.data as Record<string, unknown>)?.content as string || ""}
          </span>
          <ElementTree elements={el.children} />
        </li>
      ))}
    </ul>
  );
}

export function ReviewDialog({
  open,
  onOpenChange,
  onPublish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => void;
}) {
  const { actions } = useEditorContext();
  const activePageId = useEditorStore((s) => s.activePageId);
  const documentCache = useCmsStore((s) => s.documentCache);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tab, setTab] = useState<"summary" | "side-by-side">("summary");

  useEffect(() => {
    if (open && activePageId) {
      setLoading(true);
      (async () => {
        try {
          await actions.saveAll();
        } catch { /* ignore save errors */ }
        try {
          const diffData = await actions.getDiff(activePageId) as DiffData;
          try { await preloadReferences(diffData, documentCache); } catch { /* non-critical */ }
          setDiff(diffData);
        } catch (e) {
          console.error("Review dialog error:", e);
          setDiff(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, activePageId, actions, documentCache]);

  const fieldChanges = useMemo(() => {
    if (!diff) return new Map<string, ReturnType<typeof getFieldChanges>>();
    const map = new Map<string, ReturnType<typeof getFieldChanges>>();
    for (const el of diff.changes.modifiedElements) {
      const pub = diff.published.find((p) => p.id === el.id);
      if (!pub) continue;
      map.set(el.id, getFieldChanges(pub.data, el.data, documentCache));
    }
    return map;
  }, [diff, documentCache]);

  const handlePublish = async () => {
    setPublishing(true);
    await onPublish();
    setPublishing(false);
    onOpenChange(false);
  };

  const added = diff?.changes.added ?? 0;
  const modified = diff?.changes.modified ?? 0;
  const totalChanges = added + modified;

  return (
    <Modal open={open} onOpenChange={onOpenChange} variant="flat" maxWidth="max-w-[720px]" className="max-h-[85vh] flex flex-col border border-white/10">
      <h2 className="text-base font-semibold text-white tracking-tight">Review Changes</h2>
      <p className="text-sm text-white/50 mt-1">Review pending changes before publishing</p>

      {loading ? (
        <Spinner />
      ) : !diff ? (
        <EmptyState title="No changes to review" />
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4 mt-4">
            <button
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                tab === "summary" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
              onClick={() => setTab("summary")}
            >
              Summary
            </button>
            <button
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                tab === "side-by-side" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
              onClick={() => setTab("side-by-side")}
            >
              Side by Side
            </button>
          </div>

          {tab === "summary" ? (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {added > 0 && (
                  <div>
                    <Badge variant="success" className="mb-2">
                      <Plus className="h-3 w-3" /> {added} Added
                    </Badge>
                    {diff.changes.addedElements.map((el) => (
                      <div key={el.id} className="pl-6 text-sm text-white/60 flex items-center gap-2 py-0.5">
                        <Plus className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-white/40 font-mono text-xs">{el.type}</span>
                        <span>{previewData(el.data)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {modified > 0 && (
                  <div>
                    <Badge variant="warning" className="mb-2">
                      <Pencil className="h-3 w-3" /> {modified} Modified
                    </Badge>
                    {diff.changes.modifiedElements.map((el) => {
                      const changes = fieldChanges.get(el.id);
                      if (!changes || changes.length === 0) return null;
                      return (
                        <div key={el.id} className="pl-6 mb-3">
                          <div className="flex items-center gap-2 text-sm text-white/40 font-mono text-xs mb-1">
                            {el.type}
                            <span className="text-white/25">({changes.map((c) => c.key).join(", ")})</span>
                          </div>
                          <div className="ml-4 space-y-2 text-xs">
                            {changes.map((c) => {
                              if (c.type === "array") {
                                return (
                                  <div key={c.key}>
                                    <div className="text-white/30 mb-0.5">{c.key}</div>
                                    {c.removed.length > 0 && c.removed.map((r, i) => (
                                      <div key={`rm-${i}`} className="text-red-400/60 line-through ml-2">- {r}</div>
                                    ))}
                                    {c.added.length > 0 && c.added.map((a, i) => (
                                      <div key={`add-${i}`} className="text-emerald-400/80 ml-2">+ {a}</div>
                                    ))}
                                  </div>
                                );
                              }
                              return (
                                <div key={c.key}>
                                  <div className="text-white/30 mb-0.5">{c.key}</div>
                                  {c.oldVal && <div className="text-red-400/60 line-through ml-2">{c.oldVal}</div>}
                                  <div className="text-emerald-400/80 ml-2">{c.newVal}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalChanges === 0 && (
                  <EmptyState title="No changes detected" />
                )}
              </div>
            </ScrollArea>
          ) : (
            diff && (
              <div className="flex gap-4 flex-1 min-h-0">
                <div className="flex-1 border border-white/10 rounded-lg p-4 overflow-auto">
                  <div className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Published</div>
                  <ElementTree elements={diff.published} />
                </div>
                <div className="flex-1 border border-white/10 rounded-lg p-4 overflow-auto">
                  <div className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Draft</div>
                  <ElementTree elements={diff.draft} />
                </div>
              </div>
            )
          )}
        </>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          onClick={handlePublish}
          disabled={publishing || totalChanges === 0 || loading}
        >
          {publishing ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Publishing...
            </>
          ) : (
            <>
              <Upload className="mr-1.5 h-4 w-4" /> Publish
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

function previewData(data: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "content") parts.push(String(v));
  }
  return parts.join(" — ") || "";
}

async function preloadReferences(diff: DiffData, cache: Map<string, unknown>) {
  const allIds = new Set<string>();
  for (const el of [...diff.changes.modifiedElements, ...diff.changes.addedElements]) {
    for (const val of Object.values(el.data)) {
      if (Array.isArray(val)) {
        for (const v of val) {
          if (typeof v === "string" && v.length === 21) allIds.add(v);
        }
      } else if (typeof val === "string" && val.length === 21) {
        allIds.add(val);
      }
    }
  }
  const missing = [...allIds].filter((id) => !cache.has(id));
  if (missing.length === 0) return;

  const res = await fetch("/api/documents/batch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: missing }),
  });
  const docs = await res.json() as Array<{ id: string; data: Record<string, unknown> }>;
  for (const doc of docs) {
    cache.set(doc.id, doc);
  }
}
