import React from "react";
import { cn } from "@vitrea/utils";
import { File, ChevronRight } from "lucide-react";
import type { NodeRendererProps } from "react-arborist";
import type { CtxMenuState } from "./collapsible-section";

interface PageTreeData {
  id: string;
  name: string;
  slug: string;
  isRoot: boolean;
  pageData: { title: string; path: string; status: string; parentId?: string; order?: number; [key: string]: unknown };
  children?: PageTreeData[];
}

export function PageNode({ node, style, dragHandle, onContextMenu }: NodeRendererProps<PageTreeData> & {
  onContextMenu: (e: React.MouseEvent<HTMLElement>, s: CtxMenuState) => void;
}) {
  const selected = node.state.isSelected;
  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex items-center h-[26px] cursor-pointer group",
        selected ? "bg-editor-selected text-editor-ring" : "hover:bg-white/[0.04] text-white"
      )}
      onClick={(e) => node.handleClick(e as React.MouseEvent<HTMLElement>)}
      onContextMenu={(e) => onContextMenu(e, { x: e.clientX, y: e.clientY, kind: "page", id: node.id, isRoot: node.data.isRoot, name: node.data.name })}
    >
      {node.data.children?.length ? (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); node.toggle(); }}
          className="flex items-center justify-center w-4 h-4 flex-shrink-0 rounded hover:bg-white/[0.06] transition-colors"
        >
          <ChevronRight className={cn("h-2.5 w-2.5 text-white transition-transform duration-150", node.isOpen && "rotate-90")} />
        </button>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}
      <File className="h-3 w-3 flex-shrink-0 text-white mr-1" />
      <div className="min-w-0 flex-1 flex items-center">
        {node.state.isEditing ? (
          <input className="min-w-0 w-full rounded border border-white/10 px-1 py-0 text-[11px] outline-none bg-white/[0.06] text-white" defaultValue={node.data.name} autoFocus
            onBlur={(e) => node.submit(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") node.submit((e.target as HTMLInputElement).value); if (e.key === "Escape") node.reset(); }}
          />
        ) : (
          <span className="truncate text-[11px]">{node.data.name}</span>
        )}
      </div>
    </div>
  );
}
