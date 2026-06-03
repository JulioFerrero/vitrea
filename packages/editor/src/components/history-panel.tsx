"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "../stores";
import { useEditorContext } from "../lib/context";
import { Modal } from "@vitrea/editor-ui/modal";
import { Badge } from "@vitrea/editor-ui/form-primitives";
import { Spinner } from "@vitrea/editor-ui/spinner";
import { EmptyState } from "@vitrea/editor-ui/empty-state";
import { ScrollArea } from "@vitrea/editor-ui/scroll-area";
import { RotateCcw, Clock, Loader2 } from "lucide-react";

interface RevisionItem {
  id: string;
  label: string | null;
  createdAt: string;
}

export function HistoryPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { actions } = useEditorContext();
  const activePageId = useEditorStore((s) => s.activePageId);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (open && activePageId) {
      setLoading(true);
      actions.getRevisions(activePageId).then((data) => {
        setRevisions(data as RevisionItem[]);
        setLoading(false);
      });
    }
  }, [open, activePageId, actions]);

  const handleRestore = async (revId: string) => {
    if (!activePageId) return;
    setRestoringId(revId);
    await actions.restoreRevision(activePageId, revId);
    await actions.loadContent(activePageId);
    setRestoringId(null);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="max-w-[520px]">
      <h2 className="text-base font-semibold text-white tracking-tight">Revision History</h2>
      <p className="text-sm text-white/50 mt-1">Published versions of this page</p>

      <div className="mt-4 flex flex-col max-h-[60vh]">
        {loading ? (
          <Spinner />
        ) : revisions.length === 0 ? (
          <EmptyState title="No published revisions yet" />
        ) : (
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-1">
              {revisions.map((rev, i) => (
                <div
                  key={rev.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80">
                      {rev.label ?? `Revision ${revisions.length - i}`}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(rev.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    className={i === 0 ? "bg-white/10 text-white/60 border-white/20" : "bg-transparent text-white/30 border-transparent"}
                  >
                    {i === 0 ? "Current" : `v${revisions.length - i}`}
                  </Badge>
                  <button
                    type="button"
                    className="h-7 px-2 rounded-md opacity-0 group-hover:opacity-100 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => handleRestore(rev.id)}
                    disabled={restoringId === rev.id}
                  >
                    {restoringId === rev.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Modal>
  );
}
