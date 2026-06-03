"use client";

import { useState, useEffect } from "react";
import { Button, Input, Divider } from "@hi/editor-ui/form-primitives";
import { createApiFetch } from "../lib/api";
import { ArrowLeft, Globe, Check, Loader2 } from "lucide-react";
import { cn } from "@hi/utils";

const api = createApiFetch();

interface SiteData {
  id: string;
  slug: string;
  data: { name: string; domain?: string; settings?: Record<string, unknown> };
}

export function SiteSettingsPage({
  siteId,
}: {
  siteId: string;
  onBack: () => void;
}) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [members, setMembers] = useState<{ id: string; userId: string; userName: string; userEmail: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; email: string; role: string | null }[]>([]);
  const [addUserId, setAddUserId] = useState("");

  useEffect(() => {
    api.fetch(`/sites/${siteId}`).then((data) => {
      const s = data as SiteData;
      setSite(s);
      setName(s.data.name);
      setSlug(s.slug);
    });
    api.fetch(`/site-members?siteId=${siteId}`).then((data) => {
      setMembers(data as typeof members);
    });
    api.fetch("/admin/users").then((data) => {
      setAllUsers(data as typeof allUsers);
    });
  }, [siteId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!site) return;
    setSaving(true);
    setMsg("");
    try {
      await api.fetch(`/sites/${siteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          slug: slug || site.slug,
          data: { ...site.data, name: name || site.data.name },
        }),
      });
      setMsg("Saved");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Failed");
    }
    setSaving(false);
  }

  async function handleAddMember() {
    if (!addUserId) return;
    try {
      await api.fetch("/site-members", {
        method: "POST",
        body: JSON.stringify({ siteId, userId: addUserId }),
      });
      const data = await api.fetch(`/site-members?siteId=${siteId}`);
      setMembers(data as typeof members);
      setAddUserId("");
    } catch {
      /* ignore */
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await api.fetch(`/site-members/${memberId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      /* ignore */
    }
  }

  if (!site) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08080A]">
        <div className="h-6 w-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
      </div>
    );
  }

  const memberUserIds = new Set(members.map((m) => m.userId));
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  return (
    <div className="flex flex-col h-screen bg-[#08080A]">
      <header className="shrink-0 flex h-14 items-center px-4 border-b border-white/[0.06] bg-[#08080A]/80 backdrop-blur-xl">
        <a
            href={`/${siteId}`}
            className="flex items-center gap-1.5 text-sm text-white hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-white" /> Back
          </a>
        <span className="ml-3 h-4 w-px bg-white/[0.08]" />
        <div className="ml-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-white" />
          <h1 className="text-sm font-medium tracking-wide text-white/60">
            Site Settings
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10 space-y-10">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-4">
              General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(v) => setName(v)}
                  placeholder="Site name"
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">
                  Slug
                </label>
                <Input
                  value={slug}
                  onChange={(v) => setSlug(v)}
                  placeholder="site-slug"
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]"
                />
              </div>
            </div>
            {msg && (
              <p
                className={cn(
                  "text-xs rounded-lg px-3 py-2",
                  msg === "Saved"
                    ? "bg-emerald-500/[0.05] text-emerald-400/70 border border-emerald-500/[0.06]"
                    : "bg-red-500/[0.05] text-red-400/70 border border-red-500/[0.06]"
                )}
              >
                {msg}
              </p>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="h-9 rounded-lg bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white/85 border border-white/[0.05]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-white" />{" "}
                  Saving
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-white" /> Save
                </>
              )}
            </Button>
          </form>

          <Divider />

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">
              Members
            </h3>
            <p className="text-[11px] text-white/20">
              Users with access to this site. Admins always have access to all
              sites.
            </p>

            {members.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">
                        {m.userName}
                      </p>
                      <p className="text-[11px] text-white/30 truncate">
                        {m.userEmail}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-[11px] text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/[0.06]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {availableUsers.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={addUserId}
                  onChange={(e) =>
                    setAddUserId((e.target as HTMLSelectElement).value)
                  }
                  className="flex-1 h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white/60 px-3 transition-colors focus:outline-none focus:border-white/[0.12]"
                >
                  <option value="">Add a user...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddMember}
                  disabled={!addUserId}
                  className="h-9 rounded-lg bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white/85 border border-white/[0.05]"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
