"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "@hi/auth/client";
import { Button, Input, Divider } from "@hi/editor-ui/form-primitives";
import { createApiFetch } from "../lib/api";
import { cn } from "@hi/utils";
import { ArrowLeft, Lock, Trash2, Camera, Check, ShieldCheck, Loader2, Palette } from "lucide-react";
import { navigate } from "../lib/navigate";

const api = createApiFetch();

export function AccountPage({ onBack: _onBack }: { onBack: () => void }) {
  const { data: session, refetch } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [cursorColor, setCursorColor] = useState((user as Record<string, unknown>)?.cursorColor as string ?? "#7B61FF");
  const [profileMsg, setProfileMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUploadPhoto(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.fetch("/admin/users/me/photo", {
        method: "POST",
        body: formData as unknown as BodyInit,
      });
      const data = res as { url: string };
      setProfileMsg("Photo uploaded");
      setTimeout(async () => {
        await api.fetch("/auth/update-user", {
          method: "POST",
          body: JSON.stringify({ image: data.url }),
        });
        refetch();
      }, 300);
    } catch { setProfileMsg("Upload failed"); }
    setUploading(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg("");
    try {
      const updates: Record<string, string> = {};
      if (name !== user.name) updates.name = name;
      if (email !== user.email) updates.email = email;
      if (cursorColor !== ((user as Record<string, unknown>).cursorColor as string ?? "#7B61FF")) updates.cursorColor = cursorColor;
      if (Object.keys(updates).length === 0) { setSaving(false); return; }
      const res = await api.fetch("/auth/update-user", {
        method: "POST",
        body: JSON.stringify(updates),
      });
      const data = res as { status?: boolean; message?: string };
      setProfileMsg(data.status === false || data.message ? (data.message ?? "Error") : "Profile updated");
      refetch();
    } catch { setProfileMsg("Failed"); }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg("");
    if (newPassword.length < 8) { setPasswordMsg("Min 8 characters"); setPasswordSaving(false); return; }
    try {
      const res = await api.fetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = res as { status?: boolean; message?: string };
      if (data.status === false || data.message) {
        setPasswordMsg(data.message ?? "Error");
      } else {
        setPasswordMsg("Password changed");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch { setPasswordMsg("Failed"); }
    setPasswordSaving(false);
  }

  async function handleDeleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    try { await api.fetch("/admin/users/me", { method: "DELETE" }); navigate("/"); }
    catch { alert("Failed to delete account"); }
  }

  if (!user) return null;

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-screen bg-[#08080A]">
      <header className="shrink-0 flex h-14 items-center px-4 border-b border-white/[0.06] bg-[#08080A]/80 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-1.5 text-sm text-white hover:text-white/60 transition-colors">
          <ArrowLeft className="h-4 w-4 text-white" /> Back
        </a>
        <span className="ml-3 h-4 w-px bg-white/[0.08]" />
        <h1 className="ml-3 text-sm font-medium tracking-wide text-white/60">Edit Profile</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10 space-y-10">
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative h-20 w-20 rounded-full overflow-hidden border-2 transition-all cursor-pointer",
                  "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]",
                )}
              >
                {user.image ? (
                  <img src={user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/[0.03]">
                    <span className="text-xl font-medium text-white/15 tracking-tight">{initials}</span>
                  </div>
                )}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-full transition-opacity",
                  uploading ? "opacity-100 bg-black/60" : "opacity-0 group-hover:opacity-100 bg-black/40",
                )}>
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadPhoto(f); e.target.value = ""; }}
              />
            </div>

            <div className="space-y-0.5 min-w-0">
              <h2 className="text-lg font-semibold text-white/85 tracking-tight truncate">{user.name}</h2>
              <p className="text-sm text-white/35 truncate">{user.email}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/50">
                  <ShieldCheck className="h-3 w-3" /> Administrator
                </span>
              )}
            </div>
          </div>

          <Divider />

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">Name</label>
                <Input value={name} onChange={(v) => setName(v)} placeholder="Your name"
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">Email</label>
                <Input type="email" value={email} onChange={(v) => setEmail(v)} placeholder="you@example.com"
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">Cursor Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={cursorColor}
                      onChange={(e) => setCursorColor(e.target.value)}
                      className="h-10 w-12 rounded-lg border border-white/[0.06] bg-white/[0.02] cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {["#7B61FF", "#FF6B6B", "#4ECDC4", "#FFE66D", "#FF8A5C", "#A8E6CF", "#FF61D2", "#6C5CE7"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCursorColor(c)}
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-all",
                          cursorColor === c ? "border-white/60 scale-110" : "border-transparent hover:border-white/20",
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <Palette className="h-4 w-4 text-white ml-1" />
                </div>
              </div>
            </div>
            {profileMsg && (
              <p className={cn("text-xs rounded-lg px-3 py-2", profileMsg.includes("updated") || profileMsg.includes("uploaded") ? "bg-emerald-500/[0.05] text-emerald-400/70 border border-emerald-500/[0.06]" : "bg-red-500/[0.05] text-red-400/70 border border-red-500/[0.06]")}>{profileMsg}</p>
            )}
            <Button type="submit" disabled={saving}
              className="h-9 rounded-lg bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white/85 border border-white/[0.05]">
              {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-white" /> Saving</> : <><Check className="h-3.5 w-3.5 mr-1.5 text-white" /> Save</>}
            </Button>
          </form>

          <Divider />

          <form onSubmit={handleChangePassword} className="space-y-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">Current Password</label>
                <Input type="password" value={currentPassword} onChange={(v) => setCurrentPassword(v)} placeholder="Current password" required
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/35 mb-1.5">New Password</label>
                <Input type="password" value={newPassword} onChange={(v) => setNewPassword(v)} placeholder="Min 8 characters" required minLength={8}
                  className="h-10 rounded-lg border-white/[0.06] bg-white/[0.02] text-sm text-white/75 placeholder:text-white/15 focus:border-white/[0.12] focus:bg-white/[0.03]" />
              </div>
            </div>
            {passwordMsg && (
              <p className={cn("text-xs rounded-lg px-3 py-2", passwordMsg.includes("changed") ? "bg-emerald-500/[0.05] text-emerald-400/70 border border-emerald-500/[0.06]" : "bg-red-500/[0.05] text-red-400/70 border border-red-500/[0.06]")}>{passwordMsg}</p>
            )}
            <Button type="submit" disabled={passwordSaving}
              className="h-9 rounded-lg bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white/85 border border-white/[0.05]">
              {passwordSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Updating</> : <><Lock className="h-3.5 w-3.5 mr-1.5" /> Update</>}
            </Button>
          </form>

          <Divider />

          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">Danger Zone</h3>
            <p className="text-[11px] text-white/20">Permanently delete your account and all data. Irreversible.</p>
            <Button variant="danger" onClick={handleDeleteAccount}
              className="h-9 rounded-lg bg-red-500/[0.05] text-red-400/70 hover:bg-red-500/[0.08] border border-red-500/[0.06]">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
