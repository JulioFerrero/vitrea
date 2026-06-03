"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@hi/editor-ui/form-primitives";
import { Modal } from "@hi/editor-ui/modal";
import { Card, CardHeader, CardTitle, CardDescription } from "@hi/ui/card";
import { Plus, Globe, Users, Feather, Square, Layout, PenLine, Palette, Check, Trash2, Image as ImageIcon, Settings } from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { ConfirmDialog } from "@hi/editor-ui/confirm-dialog";
import { cn } from "@hi/utils";
import { navigate } from "../lib/navigate";
import type React from "react";
import type { EditorApi } from "../types";

interface DashboardProps {
  api: EditorApi;
  onSelectSite: (siteId: string) => void;
}

export function Dashboard({ api, onSelectSite }: DashboardProps) {
  const [sites, setSites] = useState<{ id: string; slug: string; data: { name: string } }[]>([]);
  const [newName, setNewName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [template, setTemplate] = useState("blank");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const templates = [
    { id: "minimal", name: "Studio", Icon: Feather, thumb: "bg-stone-50", description: "Clean, white, refined" },
    { id: "blank", name: "Blank", Icon: Square, thumb: "bg-white/[0.03]", description: "Empty canvas, full freedom" },
    { id: "landing", name: "Landing", Icon: Layout, thumb: "bg-indigo-500/[0.08]", description: "Hero, features, CTA" },
    { id: "blog", name: "Blog", Icon: PenLine, thumb: "bg-amber-500/[0.08]", description: "Articles, sidebar, posts" },
    { id: "portfolio", name: "Portfolio", Icon: Palette, thumb: "bg-emerald-500/[0.08]", description: "Gallery showcase" },
  ];

  useEffect(() => {
    api.fetch("/sites").then((data) => setSites(data as typeof sites));
  }, [api]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-");
    const site = (await api.fetch("/sites", {
      method: "POST",
      body: JSON.stringify({ slug, data: { name: newName.trim(), template } }),
    })) as typeof sites[number];
    setSites((prev) => [...prev, site]);
    setNewName("");
    setTemplate("blank");
    setDialogOpen(false);
    onSelectSite(site.id);
  }

  async function handleDeleteSite(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete({ id, name });
  }

  async function confirmDeleteSite() {
    if (!confirmDelete) return;
    try {
      await api.fetch(`/sites/${confirmDelete.id}`, { method: "DELETE" });
      setSites((prev) => prev.filter((s) => s.id !== confirmDelete.id));
    } catch {
      alert("Failed to delete site");
    }
    setConfirmDelete(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Web Builder</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-editor-ring/30 disabled:opacity-40 disabled:cursor-not-allowed bg-white/10 text-white hover:bg-white/15"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Site
            </button>
            <Modal open={dialogOpen} onOpenChange={setDialogOpen} maxWidth="max-w-lg">
              <h2 className="text-base font-semibold text-white tracking-tight">Create New Site</h2>
              <Input
                placeholder="Site name"
                value={newName}
                onChange={setNewName}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="space-y-3 mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">
                  Start with a template
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {templates.map((t) => {
                    const isSelected = template === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          "relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                          isSelected
                            ? "border-editor-ring/50 bg-editor-ring/[0.04]"
                            : "border-white/[0.06] bg-transparent hover:border-white/[0.10] hover:bg-white/[0.02]",
                        )}
                      >
                        <div className={cn(
                          "flex h-14 w-full items-center justify-center rounded-lg",
                          t.thumb,
                        )}>
                          <t.Icon className={cn(
                            "h-6 w-6 text-white transition-colors",
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "text-xs font-semibold transition-colors",
                            isSelected ? "text-white/80" : "text-white/50",
                          )}>
                            {t.name}
                          </p>
                          <p className="text-[11px] text-white/25 mt-0.5 leading-tight">
                            {t.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-editor-ring flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </Modal>
            <ProfileDropdown />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="group relative"
            >
              <button
                type="button"
                onClick={() => onSelectSite(site.id)}
                className="w-full text-left"
              >
                <Card className="cursor-pointer rounded-2xl border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{site.data.name}</CardTitle>
                        <CardDescription>{site.slug}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/${site.id}/settings`); }}
                className="absolute top-3 right-12 h-8 w-8 flex items-center justify-center rounded-lg bg-black/40 text-white hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Settings className="h-4 w-4 text-white" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteSite(site.id, site.data.name, e)}
                className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-lg bg-black/40 text-white hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
          {sites.length === 0 && (
            <div className="col-span-full py-24 text-center text-muted-foreground">
              <Globe className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-foreground/60">No sites yet</p>
              <p className="mt-1 text-sm">Create your first site to get started</p>
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}
        title="Delete Site"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? All pages and content will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteSite}
      />
    </div>
  );
}
