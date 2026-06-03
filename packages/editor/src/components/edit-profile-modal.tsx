"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "@hi/auth/client";
import { cn } from "@hi/utils";
import { Camera, Loader2, Palette, ShieldCheck } from "lucide-react";
import { createApiFetch } from "../lib/api";
import { Modal } from "./shared/modal";
import { GlassLabel, GlassSectionLabel, GlassButton, inputBase } from "./shared/form-primitives";

const api = createApiFetch();

export function EditProfileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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

  useEffect(() => {
    if (open && user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setCursorColor((user as Record<string, unknown>)?.cursorColor as string ?? "#7B61FF");
      setProfileMsg("");
      setPasswordMsg("");
    }
  }, [open, user]);

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
      if (name !== user?.name) updates.name = name;
      if (email !== user?.email) updates.email = email;
      if (cursorColor !== ((user as Record<string, unknown>)?.cursorColor as string ?? "#7B61FF")) updates.cursorColor = cursorColor;
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
    try { await api.fetch("/admin/users/me", { method: "DELETE" }); window.location.href = "/"; }
    catch { alert("Failed to delete account"); }
  }

  if (!open || !user) return null;

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <h2 className="text-base font-semibold text-white tracking-tight">Edit Profile</h2>

      <div className="mt-6 space-y-8">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative h-16 w-16 rounded-full overflow-hidden border-2 transition-all cursor-pointer",
                "border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03]",
              )}
            >
              {user.image ? (
                <img src={user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-white/[0.03]">
                  <span className="text-lg font-medium text-white/50 tracking-tight">{initials}</span>
                </div>
              )}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full transition-opacity",
                uploading ? "opacity-100 bg-black/60" : "opacity-0 group-hover:opacity-100 bg-black/40",
              )}>
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-white/80 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white/80" />
                )}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadPhoto(f); e.target.value = ""; }}
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <h3 className="text-base font-semibold text-white tracking-tight truncate">{user.name}</h3>
            <p className="text-sm text-white/70 truncate">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/80">
                <ShieldCheck className="h-3 w-3" /> Administrator
              </span>
            )}
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <GlassSectionLabel>Profile</GlassSectionLabel>
          <div className="space-y-3">
            <div>
              <GlassLabel>Name</GlassLabel>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputBase} />
            </div>
            <div>
              <GlassLabel>Email</GlassLabel>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputBase} />
            </div>
            <div>
              <GlassLabel>Cursor Color</GlassLabel>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="color"
                  value={cursorColor}
                  onChange={(e) => setCursorColor(e.target.value)}
                  className="h-7 w-10 rounded-md border border-white/10 bg-white/[0.06] cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                />
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
                <Palette className="h-4 w-4 text-white/30 ml-1" />
              </div>
            </div>
          </div>
          {profileMsg && (
            <p className={cn("text-xs rounded-lg px-3 py-2", profileMsg.includes("updated") || profileMsg.includes("uploaded") ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/[0.1]" : "bg-red-500/[0.08] text-red-400 border border-red-500/[0.1]")}>{profileMsg}</p>
          )}
          <GlassButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</GlassButton>
        </form>

        <div className="h-px bg-white/[0.06]" />

        <form onSubmit={handleChangePassword} className="space-y-4">
          <GlassSectionLabel>Change Password</GlassSectionLabel>
          <div className="space-y-3">
            <div>
              <GlassLabel>Current Password</GlassLabel>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required className={inputBase} />
            </div>
            <div>
              <GlassLabel>New Password</GlassLabel>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} className={inputBase} />
            </div>
          </div>
          {passwordMsg && (
            <p className={cn("text-xs rounded-lg px-3 py-2", passwordMsg.includes("changed") ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/[0.1]" : "bg-red-500/[0.08] text-red-400 border border-red-500/[0.1]")}>{passwordMsg}</p>
          )}
          <GlassButton type="submit" disabled={passwordSaving}>{passwordSaving ? "Updating..." : "Update Password"}</GlassButton>
        </form>

        <div className="h-px bg-white/[0.06]" />

        <div className="space-y-3">
          <GlassSectionLabel>Danger Zone</GlassSectionLabel>
          <p className="text-[11px] text-white/40">Permanently delete your account and all data. Irreversible.</p>
          <GlassButton variant="danger" onClick={handleDeleteAccount}>Delete Account</GlassButton>
        </div>
      </div>
    </Modal>
  );
}
