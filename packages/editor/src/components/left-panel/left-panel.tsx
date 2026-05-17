"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { buildTree } from "@hi/render";
import type { RenderElement, PageItem } from "../../types";
import { cn } from "@hi/utils";
import { Tree, type NodeRendererProps, type NodeApi } from "react-arborist";
import {
  Plus,
  Trash2,
  File,
  Pencil,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import { getIcon } from "../../icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@hi/ui/dialog";

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

interface CtxMenuState {
  x: number;
  y: number;
  kind: "page" | "element";
  id: string;
  isRoot?: boolean;
  isContainer?: boolean;
  name?: string;
}

function derivePath(slug: string, parentId: string | undefined, pages: PageItem[]): string {
  if (!parentId) return "/" + slug;
  const parent = pages.find((p) => p.id === parentId);
  if (!parent) return "/" + slug;
  return parent.data.path.replace(/\/$/, "") + "/" + slug;
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 text-muted-foreground/50 transition-transform duration-150 flex-shrink-0",
            open && "rotate-90"
          )}
        />
        <Icon className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">{title}</span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-150 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function CtxMenu({
  menu,
  onClose,
  onAction,
}: {
  menu: CtxMenuState;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, [onClose]);

  const isPage = menu.kind === "page";
  const items = isPage
    ? [
        { action: "add-child", label: "Add sub-page", icon: Plus, destructive: false },
        ...(!menu.isRoot
          ? [
              { action: "rename", label: "Rename", icon: Pencil, destructive: false },
              { action: "delete", label: "Delete", icon: Trash2, destructive: true },
            ]
          : []),
      ]
    : [
        ...(menu.isContainer ? [{ action: "add-child", label: "Add child", icon: Plus, destructive: false }] : []),
        { action: "duplicate", label: "Duplicate", icon: Copy, destructive: false },
        { action: "move-up", label: "Move up", icon: ArrowUp, destructive: false },
        { action: "move-down", label: "Move down", icon: ArrowDown, destructive: false },
        { action: "delete", label: "Delete", icon: Trash2, destructive: true },
      ];

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[140px] rounded-lg border border-border bg-popover p-1 shadow-xl"
      style={{ left: menu.x, top: menu.y, animation: "animate-in 80ms ease-out both" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.action}
            onClick={(e) => { e.stopPropagation(); onAction(item.action); onClose(); }}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] transition-colors",
              item.destructive ? "text-destructive hover:bg-destructive/10" : "text-popover-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3 w-3 opacity-50" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const ROW_H = 26;
const INDENT = 14;
const PANEL_W = 240;
const TREE_W = PANEL_W - 8;

export function LeftPanel() {
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const activeSiteId = useEditorStore((s) => s.activeSiteId);
  const elements = useEditorStore((s) => s.elements);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const selectElement = useEditorStore((s) => s.selectElement);
  const setHoveredElement = useEditorStore((s) => s.setHoveredElement);
  const updatePageLocal = useEditorStore((s) => s.updatePageLocal);
  const moveElement = useEditorStore((s) => s.moveElement);
  const reorderElement = useEditorStore((s) => s.reorderElement);
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
    const tree = buildTree(elements);
    function convert(els: RenderElement[]): ElementTreeData[] {
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
    return convert(tree);
  }, [elements, schema.elementTypes]);

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

  const countNodes = (nodes: { children?: any[] }[]): number => {
    let n = 0;
    for (const nd of nodes) { n += 1; if (nd.children?.length) n += countNodes(nd.children); }
    return n;
  };

  const pageVisibleCount = useMemo(() => countNodes(pageTreeData), [pageTreeData]);
  const elementVisibleCount = useMemo(() => countNodes(elementTreeData), [elementTreeData]);

  const handleElementMove = useCallback(({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) => {
    const dragId = dragIds[0]; if (!dragId) return; moveElement(dragId, parentId, index);
  }, [moveElement]);

  const handleElementSelect = useCallback((nodes: NodeApi<ElementTreeData>[]) => { if (nodes.length > 0 && nodes[0]) selectElement(nodes[0].id); }, [selectElement]);

  const handleAddElementToParent = useCallback(async (type: string) => {
    if (!activePageId) return;
    await actions.addElement(activePageId, type, addElementParentId);
    setAddElementParentId(null);
  }, [activePageId, addElementParentId, actions]);

  const handleContextMenu = useCallback((e: React.MouseEvent, state: CtxMenuState) => {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ ...state, y: Math.min(state.y, window.innerHeight - 280) });
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
        case "duplicate": actions.duplicateElement(id); break;
        case "move-up": reorderElement(id, "up"); break;
        case "move-down": reorderElement(id, "down"); break;
        case "delete": actions.deleteElement(id); break;
      }
    }
  }, [ctxMenu, actions, handlePageRename, reorderElement]);

  return (
    <div className="w-[240px] flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border relative select-none">
      <CollapsibleSection title="Pages" icon={File}>
        <div className="px-1 pb-0.5">
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
            onClick={async () => {
              const title = prompt("Page title:"); if (!title) return;
              await actions.createPage(activeSiteId, title, title.toLowerCase().replace(/\s+/g, "-"), rootPage?.id);
            }}
            className="mx-2 mb-1 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
          >
            <Plus className="h-3 w-3" /><span>Add page</span>
          </button>
        )}
      </CollapsibleSection>

      <div className="mx-3 border-t border-border/40" />

      <CollapsibleSection title="Elements" icon={Layers}>
        <div className="flex-1 overflow-y-auto px-1 pb-1 editor-scroll">
          {elementTreeData.length === 0 ? (
            <p className="px-3 py-4 text-[10px] text-muted-foreground/30 text-center">{activePageId ? "No elements" : "Select a page"}</p>
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

      <Dialog open={addElementParentId !== null} onOpenChange={(o) => { if (!o) setAddElementParentId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Element</DialogTitle><DialogDescription>Choose a type to add.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-3 gap-2 py-2">
            {schema.elementTypes.map((et) => {
              const Icon = getIcon(et.icon);
              return (
                <button key={et.type} onClick={() => handleAddElementToParent(et.type)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border/50 px-3 py-3 text-[10px] text-muted-foreground hover:border-editor-ring/30 hover:bg-editor-selected hover:text-editor-ring transition-colors">
                  <Icon className="h-4 w-4" /><span className="font-medium">{et.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageNode({ node, style, dragHandle, onContextMenu }: NodeRendererProps<PageTreeData> & {
  onContextMenu: (e: React.MouseEvent, s: CtxMenuState) => void;
}) {
  const selected = node.state.isSelected;
  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex items-center h-[26px] cursor-pointer group",
        selected ? "bg-editor-selected text-editor-ring" : "hover:bg-white/[0.04] text-foreground/70"
      )}
      onClick={(e) => node.handleClick(e as any)}
      onContextMenu={(e) => onContextMenu(e, { x: e.clientX, y: e.clientY, kind: "page", id: node.id, isRoot: node.data.isRoot, name: node.data.name })}
    >
      {node.data.children?.length ? (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); node.toggle(); }}
          className="flex items-center justify-center w-4 h-4 flex-shrink-0 rounded hover:bg-white/[0.06] transition-colors"
        >
          <ChevronRight className={cn("h-2.5 w-2.5 text-muted-foreground/40 transition-transform duration-150", node.isOpen && "rotate-90")} />
        </button>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}
      <File className="h-3 w-3 flex-shrink-0 text-muted-foreground/30 mr-1" />
      <div className="min-w-0 flex-1">
        {node.state.isEditing ? (
          <input className="min-w-0 w-full rounded border border-editor-ring/40 px-1 py-0 text-[11px] outline-none bg-popover text-foreground" defaultValue={node.data.name} autoFocus
            onBlur={(e) => node.submit(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") node.submit((e.target as HTMLInputElement).value); if (e.key === "Escape") node.reset(); }}
          />
        ) : (
          <span className="truncate text-[11px] leading-none">{node.data.name}</span>
        )}
      </div>
    </div>
  );
}

function ElementNode({ node, style, dragHandle, onContextMenu, onHover }: NodeRendererProps<ElementTreeData> & {
  onContextMenu: (e: React.MouseEvent, s: CtxMenuState) => void;
  onHover: (id: string | null) => void;
}) {
  const Icon = getIcon(node.data.icon) ?? File;
  const selected = node.state.isSelected;
  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex items-center h-[26px] cursor-pointer",
        selected ? "bg-editor-selected text-editor-ring" : "hover:bg-white/[0.04] text-foreground/60"
      )}
      onClick={(e) => node.handleClick(e as any)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={(e) => onContextMenu(e, { x: e.clientX, y: e.clientY, kind: "element", id: node.id, isContainer: node.data.isContainer, name: node.data.label })}
    >
      {node.data.children?.length ? (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); node.toggle(); }}
          className="flex items-center justify-center w-4 h-4 flex-shrink-0 rounded hover:bg-white/[0.06] transition-colors"
        >
          <ChevronRight className={cn("h-2.5 w-2.5 text-muted-foreground/40 transition-transform duration-150", node.isOpen && "rotate-90")} />
        </button>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}
      <Icon className="h-3 w-3 flex-shrink-0 text-muted-foreground/30 mr-1" />
      <div className="min-w-0 flex-1">
        <span className="truncate text-[11px] leading-none">{node.data.label}</span>
      </div>
    </div>
  );
}
