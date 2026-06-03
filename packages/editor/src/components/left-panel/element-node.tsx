import React from "react";
import { cn } from "@vitrea/utils";
import { File, ChevronRight } from "lucide-react";
import { getIcon } from "../../icons";
import type { NodeRendererProps } from "react-arborist";
import type { CtxMenuState } from "./collapsible-section";

interface ElementTreeData {
  id: string;
  type: string;
  label: string;
  icon: string;
  content: string;
  isContainer: boolean;
  children?: ElementTreeData[];
}

export function ElementNode({ node, style, dragHandle, onContextMenu, onHover }: NodeRendererProps<ElementTreeData> & {
  onContextMenu: (e: React.MouseEvent<HTMLElement>, s: CtxMenuState) => void;
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
        selected ? "bg-editor-selected text-editor-ring" : "hover:bg-white/[0.04] text-white"
      )}
      onClick={(e) => node.handleClick(e as React.MouseEvent<HTMLElement>)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={(e) => onContextMenu(e, { x: e.clientX, y: e.clientY, kind: "element", id: node.id, isContainer: node.data.isContainer, name: node.data.label })}
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
      <Icon className="h-3 w-3 flex-shrink-0 text-white mr-1" />
      <div className="min-w-0 flex-1 flex items-center">
        <span className="truncate text-[11px]">{node.data.label}</span>
      </div>
    </div>
  );
}
