"use client";

import React from "react";
import { useState } from "react";
import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { Separator } from "@vitrea/editor-ui/separator";
import { Badge } from "@vitrea/editor-ui/form-primitives";
import {
  Undo2,
  Redo2,
  Loader2,
  Check,
  Upload,
  History,
  Users,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { cn } from "@vitrea/utils";
import { ReviewDialog } from "../review-dialog";
import { HistoryPanel } from "../history-panel";
import { ProfileDropdown } from "../profile-dropdown";
import { IconButton } from "@vitrea/editor-ui/icon-button";
import { navigate } from "../../lib/navigate";
import { glassStyle } from "@vitrea/editor-ui/glass";

function DraftStatusBadge() {
  const hasActiveDraft = useEditorStore((s) => s.hasActiveDraft);
  const isDirty = useEditorStore((s) => s.isDirty);
  const saveStatus = useEditorStore((s) => s.saveStatus);

  if (saveStatus === "saving") {
    return (
      <Badge variant="warning">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </Badge>
    );
  }

  if (saveStatus === "saved" && !isDirty) {
    return (
      <Badge variant="success">
        <Check className="h-3 w-3" />
        Draft saved
      </Badge>
    );
  }

  if (isDirty || hasActiveDraft) {
    return (
      <Badge variant="warning">
        Unsaved draft
      </Badge>
    );
  }

  return (
    <Badge variant="default">
      Published
    </Badge>
  );
}

function PublishButton() {
  const isDirty = useEditorStore((s) => s.isDirty);
  const hasActiveDraft = useEditorStore((s) => s.hasActiveDraft);
  const { actions } = useEditorContext();
  const [reviewOpen, setReviewOpen] = useState(false);

  const showPublish = isDirty || hasActiveDraft;

  return (
    <>
      <button
        type="button"
        onClick={() => setReviewOpen(true)}
        className={cn(
          "py-1 px-3 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5",
          showPublish ? "bg-white text-black hover:bg-white/90" : "text-white/50 hover:bg-white/10 hover:text-white border border-white/10",
        )}
      >
        <Upload className="h-3.5 w-3.5 text-white" />
        Review & Publish
      </button>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onPublish={async () => {
          await actions.publishPage();
        }}
      />
    </>
  );
}

export function TopBar() {
  const activeSiteName = useEditorStore((s) => s.activeSiteName);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="relative z-50 flex items-center px-4 py-1 backdrop-blur-[10px] rounded-2xl" style={glassStyle}>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-base font-semibold text-white tracking-tight hover:text-white transition-colors"
        >
          Hi!
        </button>
        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />
        <span className="text-sm text-white/90">{activeSiteName ?? "No site selected"}</span>
        <DraftStatusBadge />
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <IconButton icon={History} label="History" onClick={() => setHistoryOpen(true)} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />
        <IconButton icon={FileText} label="Content" onClick={() => { const siteId = useEditorStore.getState().activeSiteId; if (siteId) navigate(`/${siteId}/content`); }} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <IconButton icon={ImageIcon} label="Assets" onClick={() => { const siteId = useEditorStore.getState().activeSiteId; if (siteId) navigate(`/${siteId}/assets`); }} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <Separator orientation="vertical" className="mx-1 h-6 bg-white/10" />
        <IconButton icon={Undo2} label="Undo" onClick={undo} disabled={!canUndo()} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <IconButton icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo()} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <Separator orientation="vertical" className="mx-1.5 h-6 bg-white/10" />
        <IconButton icon={Users} label="Users" onClick={() => navigate("/admin/users")} tooltipPosition="bottom" iconSize="h-4 w-4" />
        <ProfileDropdown />
        <Separator orientation="vertical" className="mx-1.5 h-6 bg-white/10" />
        <PublishButton />
      </div>

      <HistoryPanel open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
