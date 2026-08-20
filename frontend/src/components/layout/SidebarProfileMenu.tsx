"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clearStoredGuestSession } from "@/components/auth/guest-session";
import { useWorkspaceProfile } from "@/components/auth/workspace-profile";

export function SidebarProfileMenu() {
  const router = useRouter();
  const profile = useWorkspaceProfile();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearStoredGuestSession();
    setIsOpen(false);
    router.replace("/login");
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 rounded-[8px] border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-surface"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface text-[11px] font-semibold text-foreground">
          {profile.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold leading-4 text-foreground">
            {profile.fullName}
          </p>
          <p className="truncate text-[10px] leading-4 text-muted">{profile.title}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Profile"
          className="absolute left-0 top-full z-20 mt-2 w-[232px] rounded-[10px] border border-border bg-background p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-2.5 rounded-[8px] border border-border bg-surface px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-border bg-background text-[12px] font-semibold text-foreground">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-4 text-foreground">
                {profile.fullName}
              </p>
              <p className="truncate text-[10px] leading-4 text-muted">
                {profile.email}
              </p>
            </div>
          </div>

          <Link
            href="/settings/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="mt-1.5 flex h-8 items-center gap-2 rounded-[8px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            <Settings2 className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            Profile settings
          </Link>

          <div className="my-1.5 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex h-8 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
