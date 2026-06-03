"use client";

import { useState, useEffect } from "react";
import { Button } from "@hi/ui/button";
import { Input } from "@hi/ui/input";
import { Badge } from "@hi/ui/badge";
import { createApiFetch } from "../lib/api";
import { Trash2, UserPlus, Shield, ShieldOff, X } from "lucide-react";
import { cn } from "@hi/utils";

const api = createApiFetch();

interface UserEntry {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string | null;
  createdAt: string;
}

export function UsersPage({ onBack: _onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await api.fetch("/admin/users");
      setUsers(data as UserEntry[]);
    } catch {
      setError("Failed to load users");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.fetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
    } catch {
      setError("Failed to create user");
    }
  }

  async function handleRoleToggle(u: UserEntry) {
    if (u.role === "admin") return;
    const newRole = u.role === "user" ? "admin" : "user";
    try {
      await api.fetch(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string, u: UserEntry) {
    if (u.role === "admin") return;
    if (!confirm(`Delete ${u.email}?`)) return;
    try {
      await api.fetch(`/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center px-6 border-b border-border/40">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-4">
          &larr; Back
        </a>
        <h1 className="text-base font-semibold text-foreground">User Management</h1>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add User
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {showCreate && (
          <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Create New User</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName((e.target as HTMLInputElement).value)} required />
              <Input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail((e.target as HTMLInputElement).value)} required />
              <Input placeholder="Password (min 8 chars)" type="password" value={newPassword} onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)} required minLength={8} />
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole((e.target as HTMLSelectElement).value)}
                  className="flex h-9 w-full rounded-xl border border-border bg-transparent text-foreground px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" size="sm">Create</Button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/40">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{u.name}</span>
                      <Badge className={cn(
                        "text-[11px]",
                        u.role === "admin"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      )}>
                        {u.role ?? "user"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleRoleToggle(u)}
                    disabled={u.role === "admin"}
                    title={u.role === "admin" ? "Admin" : "Make Admin"}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg transition-colors",
                      u.role === "admin"
                        ? "text-amber-400/50 cursor-default"
                        : "text-white/30 hover:text-amber-400 hover:bg-amber-500/10"
                    )}
                  >
                    {u.role === "admin" ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u)}
                    disabled={u.role === "admin"}
                    title={u.role === "admin" ? "Cannot delete admin" : "Delete user"}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg transition-colors",
                      u.role === "admin"
                        ? "text-white/10 cursor-default"
                        : "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
