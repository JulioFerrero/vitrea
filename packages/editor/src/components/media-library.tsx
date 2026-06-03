"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@hi/editor-ui/modal";
import { Button } from "@hi/editor-ui/form-primitives";
import { Spinner } from "@hi/editor-ui/spinner";
import { EmptyState } from "@hi/editor-ui/empty-state";
import { cn } from "@hi/utils";
import { Upload, Image as ImageIcon, Trash2, Check } from "lucide-react";
import type { EditorApi } from "../../types";

interface FileEntry {
  id: string;
  siteId: string;
  data: {
    url: string;
    name?: string;
    type?: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  createdAt: string;
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  siteId: string;
  api: EditorApi;
}

export function MediaLibrary({ open, onClose, onSelect, siteId, api }: MediaLibraryProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.fetch(`/files?siteId=${encodeURIComponent(siteId)}`);
      setFiles(res as FileEntry[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, [api, siteId]);

  useEffect(() => {
    if (open) fetchFiles();
  }, [open, fetchFiles]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("siteId", siteId);
      formData.append("file", file);

      const res = await api.fetch("/files/upload", {
        method: "POST",
        body: formData as unknown as BodyInit,
      });
      setFiles((prev) => [res as FileEntry, ...prev]);
    } catch { /* ignore */ }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    try {
      await api.fetch(`/files/${id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch { /* ignore */ }
  }

  function handleSelect() {
    if (selectedUrl) {
      onSelect(selectedUrl);
      setSelectedUrl(null);
      onClose();
    }
  }

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) { setSelectedUrl(null); onClose(); } }} variant="flat" maxWidth="max-w-2xl" className="max-h-[85vh] flex flex-col">
      <h2 className="text-base font-semibold text-white tracking-tight">Media Library</h2>

      <div className="flex-1 overflow-y-auto editor-scroll space-y-4 mt-4">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
            dragOver
              ? "border-editor-ring/60 bg-editor-ring/5"
              : "border-white/10 hover:border-white/20",
            uploading && "pointer-events-none opacity-50",
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleUpload(f);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <div className="space-y-2">
              <div className="h-8 w-8 border-2 border-editor-ring/30 border-t-editor-ring rounded-full animate-spin mx-auto" />
              <p className="text-xs text-white/40">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-white/40">
                Drag &amp; drop or <span className="text-editor-ring">browse</span>
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : files.length === 0 ? (
          <EmptyState title="No files yet" icon={ImageIcon} />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {files.map((f) => {
              const d = f.data;
              const isSelected = selectedUrl === d.url;
              const isImg = d.type?.startsWith("image/") ?? true;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedUrl(isSelected ? null : d.url)}
                  className={cn(
                    "group relative aspect-square rounded-xl overflow-hidden border transition-all",
                    isSelected
                      ? "border-editor-ring ring-2 ring-editor-ring/30"
                      : "border-white/[0.06] hover:border-white/20",
                  )}
                >
                  {isImg ? (
                    <img src={d.url} alt={d.name ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                      <span className="text-[9px] text-white/30 truncate px-1">
                        {d.name?.split(".").pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 bg-editor-ring/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                    className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-lg bg-black/60 text-white hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedUrl && (
        <div className="flex justify-end pt-2 border-t border-white/[0.06] mt-2">
          <Button onClick={handleSelect}>
            Insert Selected
          </Button>
        </div>
      )}
    </Modal>
  );
}
