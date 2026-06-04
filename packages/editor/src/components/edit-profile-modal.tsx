"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@vitrea/auth/client";
import { cn } from "@vitrea/utils";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { createApiFetch } from "../lib/api";
import { Modal } from "@vitrea/editor-ui/modal";
import { SectionLabel, Button, Alert, Divider, ColorInput, Field, Input } from "@vitrea/editor-ui/form-primitives";

const api = createApiFetch();
type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  cursorColor?: string | null;
};

export function EditProfileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: session, refetch } = useSession();
  const user = session?.user as SessionUser | undefined;

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

  if (!user) return null;

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
            <h3 className="text-base font-semibold text-white tracking-tight truncate">{user.name}</h3>
            <p className="text-sm text-white/70 truncate">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400/80">
                <ShieldCheck className="h-3 w-3" /> Administrator
              </span>
            )}
          </div>
        </div>

        <Divider />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <SectionLabel>Profile</SectionLabel>
          <div className="space-y-3">
            <Field label="Name">
              <Input value={name} onChange={setName} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            </Field>
            <Field label="Cursor Color">
              <ColorInput value={cursorColor} onChange={setCursorColor} />
            </Field>
          </div>
          {profileMsg && (
            <Alert variant={profileMsg.includes("updated") || profileMsg.includes("uploaded") ? "success" : "error"}>{profileMsg}</Alert>
          )}
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </form>

        <Divider />

        <form onSubmit={handleChangePassword} className="space-y-4">
          <SectionLabel>Change Password</SectionLabel>
          <div className="space-y-3">
            <Field label="Current Password">
              <Input type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="Current password" required />
            </Field>
            <Field label="New Password">
              <Input type="password" value={newPassword} onChange={setNewPassword} placeholder="Min 8 characters" required minLength={8} />
            </Field>
          </div>
          {passwordMsg && (
            <Alert variant={passwordMsg.includes("changed") ? "success" : "error"}>{passwordMsg}</Alert>
          )}
          <Button type="submit" disabled={passwordSaving}>{passwordSaving ? "Updating..." : "Update Password"}</Button>
        </form>

        <Divider />

        <div className="space-y-3">
          <SectionLabel>Danger Zone</SectionLabel>
          <p className="text-[11px] text-white/40">Permanently delete your account and all data. Irreversible.</p>
          <Button variant="danger" onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </div>
    </Modal>
  );
}
