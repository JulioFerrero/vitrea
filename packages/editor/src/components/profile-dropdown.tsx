"use client";

import { useState } from "react";
import { useSession, signOut } from "@hi/auth/client";
import { cn } from "@hi/utils";
import { ChevronDown, User, LogOut } from "lucide-react";
import { EditProfileModal } from "./edit-profile-modal";
import { Dropdown, DropdownItem, DropdownHeader } from "@hi/editor-ui/dropdown";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const user = session?.user;
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!user) return null;

  const initials = (user.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const trigger = (
    <button
      type="button"
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
      <ChevronDown className="h-3 w-3 text-white" />
    </button>
  );

  return (
    <>
      <Dropdown trigger={trigger}>
        <DropdownHeader>
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-white/70 truncate mt-0.5">{user.email}</p>
        </DropdownHeader>
        <DropdownItem onClick={() => setProfileModalOpen(true)}>
          <User className="h-4 w-4" />
          Edit Profile
        </DropdownItem>
        <DropdownItem
          variant="danger"
          onClick={() => { signOut(); window.location.href = "/"; }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownItem>
      </Dropdown>
      <EditProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </>
  );
}
