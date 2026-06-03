import React from "react";
import { useState, useCallback, useMemo } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import type { PageElement, PageItem } from "../../types";
import { Tree, type NodeApi } from "react-arborist";
import {
  Plus,
  File,
  Layers,
} from "lucide-react";
import { CollapsibleSection, type CtxMenuState } from "./collapsible-section";
import { CtxMenu } from "./context-menu";
import { PageNode } from "./page-node";
import { ElementNode } from "./element-node";
import { AddElementDialog } from "./add-element-dialog";
import { derivePath } from "../../lib/paths";
import { countNodes } from "./utils";
import { glassStyle, glassPanelClass } from "@vitrea/editor-ui/glass";

interface PageTreeData {
  id: string;
  name: string;
  slug: string;
  isRoot: boolean;
  pageData: PageItem["data"];
  children?: PageTreeData[];
}

interface ElementTreeData {
  id: string;
  type: string;
  label: string;
  icon: string;
  content: string;
  isContainer: boolean;
  children?: ElementTreeData[];
}

const ROW_H = 26;
const INDENT = 14;
const PANEL_W = 240;
const TREE_W = PANEL_W - 8;

export function LeftPanel() {
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const activeSiteId = useEditorStore((s) => s.activeSiteId);
  const content = useEditorStore((s) => s.content);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const selectElement = useEditorStore((s) => s.selectElement);
  const setHoveredElement = useEditorStore((s) => s.setHoveredElement);
  const updatePageLocal = useEditorStore((s) => s.updatePageLocal);
  const { schema, actions } = useEditorContext();

  const [addElementParentId, setAddElementParentId] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);

  const rootPage = pages.find((p) => p.data.path === "/");

  const pageTreeData = useMemo<PageTreeData[]>(() => {
    function buildChildren(parentId: string): PageTreeData[] {
      return pages
        .filter((p) => p.data.parentId === parentId)
        .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
        .map((p) => ({ id: p.id, name: p.data.title, slug: p.slug, isRoot: false, pageData: p.data, children: buildChildren(p.id) }));
    }
    if (!rootPage) return [];
    return [{ id: rootPage.id, name: rootPage.data.title, slug: rootPage.slug, isRoot: true, pageData: rootPage.data, children: buildChildren(rootPage.id) }];
  }, [pages, rootPage]);

  const elementTreeData = useMemo<ElementTreeData[]>(() => {
    function convert(els: PageElement[]): ElementTreeData[] {
      return els.map((el) => {
        const typeConfig = schema.elementTypes.find((t) => t.type === el.type);
        return {
          id: el.id, type: el.type, label: typeConfig?.label ?? el.type,
          icon: typeConfig?.icon ?? "file",
          content: el.data.content ? String(el.data.content).slice(0, 30) : "",
          isContainer: typeConfig?.isContainer ?? false,
          children: el.children?.length ? convert(el.children) : undefined,
        };
      });
    }
    return convert(content);
  }, [content, schema.elementTypes]);

  const handlePageMove = useCallback(
    ({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) => {
      const dragId = dragIds[0];
      if (!dragId) return;
      const newParentId = parentId ?? undefined;
      const draggedPage = pages.find((p) => p.id === dragId);
      if (!draggedPage) return;
      const newPath = derivePath(draggedPage.slug, newParentId, pages);
      updatePageLocal(dragId, { data: { ...draggedPage.data, parentId: newParentId, path: newPath, order: index } });
      const siblings = pages.filter((p) => p.data.parentId === newParentId && p.id !== dragId);
      siblings.forEach((sib, i) => { updatePageLocal(sib.id, { data: { ...sib.data, order: i < index ? i : i + 1 } }); });
    }, [pages, updatePageLocal]
  );

  const handlePageRename = useCallback(({ id, name }: { id: string; name: string }) => {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const newSlug = name.toLowerCase().replace(/\s+/g, "-");
    updatePageLocal(id, { slug: newSlug, data: { ...page.data, title: name, path: derivePath(newSlug, page.data.parentId, pages) } });
  }, [pages, updatePageLocal]);

  const handlePageDelete = useCallback(({ ids }: { ids: string[] }) => { for (const id of ids) actions.deletePage(id); }, [actions]);
  const handlePageSelect = useCallback((nodes: NodeApi<PageTreeData>[]) => { if (nodes.length > 0 && nodes[0]) setActivePage(nodes[0].id); }, [setActivePage]);

  const pageVisibleCount = useMemo(() => countNodes(pageTreeData), [pageTreeData]);
  const elementVisibleCount = useMemo(() => countNodes(elementTreeData), [elementTreeData]);

  const handleElementMove = useCallback(({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) => {
    const dragId = dragIds[0]; if (!dragId) return; actions.moveNodeTo(dragId, parentId, index);
  }, [actions]);

  const handleElementSelect = useCallback((nodes: any[]) => {
    const id = nodes.length > 0 ? nodes[0].id : null;
    selectElement(id);
  }, [selectElement]);

  const handleAddElement = useCallback(async (type: string) => {
    if (!activePageId) return;
    await actions.addChild(addElementParentId, type);
    setAddElementParentId(null);
  }, [addElementParentId, actions]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLElement>, state: CtxMenuState) => {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ ...state, y: Math.min(state.y, globalThis.innerHeight - 280) });
  }, []);

  const handleCtxAction = useCallback((action: string) => {
    if (!ctxMenu) return;
    const id = ctxMenu.id;
    if (ctxMenu.kind === "page") {
      switch (action) {
        case "add-child": { const t = prompt("Sub-page title:"); if (!t) return; const s = t.toLowerCase().replace(/\s+/g, "-"); const sid = useEditorStore.getState().activeSiteId; if (sid) actions.createPage(sid, t, s, id); break; }
        case "rename": { const n = prompt("New name:", ctxMenu.name); if (!n) return; handlePageRename({ id, name: n }); break; }
        case "delete": actions.deletePage(id); break;
      }
    } else {
      switch (action) {
        case "add-child": setAddElementParentId(id); break;
        case "duplicate": actions.duplicateNode(id); break;
        case "move-up": actions.moveNodeUp(id); break;
        case "move-down": actions.moveNodeDown(id); break;
        case "delete": actions.deleteNode(id); break;
      }
      }
    }, [ctxMenu, actions, handlePageRename]);

  return (
    <div className="w-[240px] h-full flex flex-col backdrop-blur-[10px] relative select-none rounded-2xl" style={glassStyle}>
      <div className="flex flex-col flex-1 overflow-x-hidden">
      <CollapsibleSection title="Pages" icon={File}>
        <div className="px-1 pb-0.5 overflow-x-hidden">
          <Tree<PageTreeData>
            data={pageTreeData}
            width={TREE_W}
            height={Math.max(pageVisibleCount * ROW_H, ROW_H)}
            rowHeight={ROW_H}
            indent={INDENT}
            openByDefault={false}
            selection={activePageId ?? undefined}
            onSelect={handlePageSelect}
            onMove={handlePageMove}
            onRename={handlePageRename}
            onDelete={handlePageDelete}
            disableDrag={(d: PageTreeData) => d.isRoot}
            disableDrop={({ dragNodes }) => dragNodes.some((n) => n.data.isRoot)}
          >
            {(props) => <PageNode {...props} onContextMenu={handleContextMenu} />}
          </Tree>
        </div>
        {activeSiteId && (
          <button
            type="button"
            onClick={async () => {
              const title = prompt("Page title:"); if (!title) return;
              await actions.createPage(activeSiteId, title, title.toLowerCase().replace(/\s+/g, "-"), rootPage?.id);
            }}
            className="mx-2 mb-1 flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Plus className="h-3 w-3 text-white" /><span>Add page</span>
          </button>
        )}
      </CollapsibleSection>

      <div className="mx-3 border-t border-white/[0.06]" />

      <CollapsibleSection title="Elements" icon={Layers}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pb-1 editor-scroll">
          {elementTreeData.length === 0 ? (
            <p className="px-3 py-4 text-[11px] text-white/60 text-center">{activePageId ? "No elements" : "Select a page"}</p>
          ) : (
            <Tree<ElementTreeData>
              data={elementTreeData}
              width={TREE_W}
              height={Math.max(elementVisibleCount * ROW_H, ROW_H)}
              rowHeight={ROW_H}
              indent={INDENT}
              openByDefault={false}
              selection={selectedElementId ?? undefined}
              onSelect={handleElementSelect}
              onMove={handleElementMove}
            >
              {(props) => <ElementNode {...props} onContextMenu={handleContextMenu} onHover={setHoveredElement} />}
            </Tree>
          )}
        </div>
      </CollapsibleSection>

      {ctxMenu && <CtxMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} onAction={handleCtxAction} />}

      <AddElementDialog
        open={addElementParentId !== null}
        onOpenChange={(o) => { if (!o) setAddElementParentId(null); }}
        elementTypes={schema.elementTypes}
        onSelect={handleAddElement}
      />
      </div>
    </div>
  );
}
