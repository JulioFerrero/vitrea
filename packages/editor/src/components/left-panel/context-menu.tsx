import { useEffect, useRef } from "react";
import { cn } from "@hi/utils";
import {
  Plus,
  Trash2,
  Pencil,
  Copy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { CtxMenuState } from "./collapsible-section";

export function CtxMenu({
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
      className="fixed z-50 min-w-[140px] rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl p-1 shadow-xl"
      style={{ left: menu.x, top: menu.y, animation: "animate-in 80ms ease-out both" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.action}
            onClick={(e) => { e.stopPropagation(); onAction(item.action); onClose(); }}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] transition-colors",
              item.destructive ? "text-destructive hover:bg-destructive/10" : "text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-3 w-3 opacity-60" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
