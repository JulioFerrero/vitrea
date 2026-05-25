"use client";

import { useEffect, useRef } from "react";
import { useEditorStore, type SaveStatus } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { Button } from "@hi/ui/button";
import { Separator } from "@hi/ui/separator";
import { Save, Undo2, Redo2, Loader2, Check } from "lucide-react";
import { cn } from "@hi/utils";

function SaveButton() {
  const isDirty = useEditorStore((s) => s.isDirty);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const { actions } = useEditorContext();
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (saveStatus === "saved" && !isDirty) {
      savedTimerRef.current = setTimeout(() => {
        useEditorStore.getState().setSaveStatus("idle");
      }, 2000);
      return () => clearTimeout(savedTimerRef.current);
    }
  }, [saveStatus, isDirty]);

  const label: Record<SaveStatus, string> = {
    idle: isDirty ? "Save" : "Saved",
    saving: "Saving...",
    saved: "Saved",
  };

  const icon = saveStatus === "saving"
    ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
    : saveStatus === "saved" && !isDirty
      ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" />
      : <Save className="mr-1.5 h-4 w-4" />;

  return (
    <Button
      size="sm"
      variant={isDirty ? "default" : "outline"}
      disabled={!isDirty || saveStatus === "saving"}
      onClick={() => actions.saveAll()}
      className={cn(
        "min-w-[84px] transition-all duration-200",
        saveStatus === "saved" && !isDirty && "border-emerald-500/40 text-emerald-400 hover:text-emerald-400",
      )}
    >
      {icon}
      {label[saveStatus]}
    </Button>
  );
}

export function TopBar() {
  const activeSiteId = useEditorStore((s) => s.activeSiteId);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  return (
    <div className="flex h-14 items-center px-4 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <span className="text-base font-semibold text-white/90 tracking-tight">
          Web Builder
        </span>
        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />
        <span className="text-sm text-white/40">{activeSiteId ?? "No site selected"}</span>
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/80"
          onClick={() => {
            const siteId = useEditorStore.getState().activeSiteId;
            if (siteId) window.location.href = `/content/${siteId}`;
          }}
          title="Content"
        >
          Content
        </button>
        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
          disabled={!canUndo()}
          onClick={undo}
          title="Undo"
        >
          <Undo2 className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
          disabled={!canRedo()}
          onClick={redo}
          title="Redo"
        >
          <Redo2 className="h-4.5 w-4.5" />
        </button>
        <Separator orientation="vertical" className="mx-1.5 h-6 bg-white/10" />
        <SaveButton />
      </div>
    </div>
  );
}
