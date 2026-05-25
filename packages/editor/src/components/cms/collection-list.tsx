"use client";

import { useMemo } from "react";
import { useCmsStore } from "../../stores/cms-store";

type SI = { type: string; title?: string; collection?: string; filter?: Record<string, string>; items?: SI[] };

function docKey(col: string, filter: Record<string, string> | null) {
  return filter ? `${col}::${JSON.stringify(filter)}` : col;
}

export function CollectionListSidebar() {
  const structure = useCmsStore((s) => s.structure) as SI[];
  const collections = useCmsStore((s) => s.collections);
  const selectedCollection = useCmsStore((s) => s.selectedCollection);
  const structureFilter = useCmsStore((s) => s.structureFilter);
  const rawDocsByCol = useCmsStore((s) => s.documentsByCollection);
  const documentsByCollection = rawDocsByCol ?? {};
  const navPath = useCmsStore((s) => s.navPath);

  const hasStructure = structure.length > 0;

  function navigate(path: number[]) {
    useCmsStore.getState().navigate(path);
  }

  function select(col: any, filter: Record<string, string> | null) {
    useCmsStore.getState().selectCollection(col);
    useCmsStore.getState().setStructureFilter(filter);
  }

  const columns = useMemo(() => {
    if (!hasStructure) return [];
    const cols: { items: SI[]; selectedIndex: number }[] = [];

    let items = structure;
    for (let i = 0; i <= navPath.length; i++) {
      const idx = navPath[i] ?? -1;
      cols.push({ items, selectedIndex: idx });

      if (i < navPath.length) {
        const selectedItem = items[navPath[i]];
        if (selectedItem?.type === "list" && selectedItem.items) {
          items = selectedItem.items;
        } else {
          break;
        }
      }
    }
    return cols;
  }, [structure, navPath, hasStructure]);

  if (!hasStructure && collections.length === 0) {
    return (
      <div className="w-56 flex flex-col bg-black/80 backdrop-blur-xl border-r border-white/[0.06]">
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Content</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] text-white/20">No collections</p>
        </div>
      </div>
    );
  }

  if (!hasStructure) {
    return (
      <div className="w-56 flex flex-col bg-black/80 backdrop-blur-xl border-r border-white/[0.06]">
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Content</h2>
        </div>
        <div className="flex-1 overflow-y-auto editor-scroll py-1">
          {collections.map((col: any) => (
            <button
              key={col.id}
              type="button"
              onClick={() => select(col, null)}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-all duration-200 ${
                selectedCollection?.id === col.id
                  ? "bg-editor-selected text-editor-ring"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white/90"
              }`}
            >
              <span className="truncate">{col.label}</span>
              <span className="text-[10px] ml-2 text-white/30">
                {(documentsByCollection[col.name] ?? []).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {columns.map((col, colIdx) => {
        const depth = colIdx;
        return (
          <div key={colIdx} className="w-56 flex-shrink-0 flex flex-col bg-black/80 backdrop-blur-xl border-r border-white/[0.06]">
            <div className="flex-1 overflow-y-auto editor-scroll py-1">
              {col.items.map((item, idx) => {
                if (item.type === "divider") {
                  return <div key={idx} className="my-1 mx-3 border-t border-white/[0.06]" />;
                }

                if (item.type === "list") {
                  const isSel = col.selectedIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newPath = [...navPath.slice(0, depth), idx];
                        navigate(newPath);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-all duration-200 ${
                        isSel
                          ? "bg-editor-selected text-editor-ring"
                          : "text-white/70 hover:bg-white/[0.04] hover:text-white/90"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        className="text-white/20 flex-shrink-0 ml-2">
                        <path d="M3 2l4 3-4 3" />
                      </svg>
                    </button>
                  );
                }

                if (item.type === "collection") {
                  const colObj = collections.find((c: any) => c.name === item.collection);
                  if (!colObj) return null;
                  const filter = item.filter ?? null;
                  const isSelected = selectedCollection?.id === colObj.id &&
                    JSON.stringify(structureFilter) === JSON.stringify(filter);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newPath = navPath.slice(0, depth);
                        navigate(newPath);
                        select(colObj, filter);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-all duration-200 ${
                        isSelected
                          ? "bg-editor-selected text-editor-ring"
                          : "text-white/70 hover:bg-white/[0.04] hover:text-white/90"
                      }`}
                    >
                      <span className="truncate">{item.title ?? colObj.label}</span>
                      <span className={`text-[10px] ml-2 ${isSelected ? "text-editor-ring/70" : "text-white/30"}`}>
                        {(documentsByCollection[docKey(item.collection ?? "", filter)] ?? []).length}
                      </span>
                    </button>
                  );
                }

                return null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
