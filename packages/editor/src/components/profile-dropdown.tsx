"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "@hi/auth/client";
import { cn } from "@hi/utils";
import { ChevronDown, User, LogOut } from "lucide-react";
import { EditProfileModal } from "./edit-profile-modal";
import { glassDarkStyle } from "../lib/glass";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const user = session?.user;
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => {
    setOpen(false);
    setAnimIn(false);
    setLeaving(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, close]);

  function toggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    }
  }

  function openProfileModal() {
    close();
    setProfileModalOpen(true);
  }

  if (!user) return null;

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const triggerRect = triggerRef.current?.getBoundingClientRect();
  const dropdownPos: React.CSSProperties = triggerRect
    ? { position: "fixed", top: triggerRect.bottom + 8, right: window.innerWidth - triggerRect.right, width: 224 }
    : {};

  const menu = visible ? (
    <div className={cn(
      "rounded-2xl z-[999] transition-all duration-150 ease-out",
      animIn && !leaving ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1",
    )} style={{ ...glassDarkStyle, ...dropdownPos }}>
      <div className="px-4 py-3 border-b border-white/[0.08] rounded-t-2xl">
        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
        <p className="text-xs text-white/70 truncate mt-0.5">{user.email}</p>
      </div>

      <button
        type="button"
        onClick={openProfileModal}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
      >
        <User className="h-4 w-4" />
        Edit Profile
      </button>

      <button
        type="button"
        onClick={() => { signOut(); window.location.href = "/"; }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-b-2xl"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 rounded-full p-0.5 pr-2 transition-all duration-150",
          "border border-white/[0.06] hover:border-white/[0.12]",
          "bg-white/[0.02] hover:bg-white/[0.04]",
        )}
      >
        <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-white/[0.06]">
          {user.image ? (
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] font-medium text-white/80">{initials}</span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-3 w-3 text-white/80 transition-transform duration-150",
          open && "rotate-180",
        )} />
      </button>

      {menu && createPortal(menu, document.body)}

      <EditProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </div>
  );
}
