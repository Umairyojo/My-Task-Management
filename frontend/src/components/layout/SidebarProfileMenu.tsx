"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  MoonStar,
  Settings2,
  SunMedium,
} from "lucide-react";
import { clearStoredGuestSession } from "@/components/auth/guest-session";
import { useWorkspaceProfile } from "@/components/auth/workspace-profile";
import { Avatar } from "./Avatar";
import {
  colorModeOptions,
  setStoredColorMode,
  type ColorMode,
} from "./color-mode";
import { useColorMode } from "./use-color-mode";
import {
  applyColorPalette,
  colorPaletteOptions,
  getStoredColorPalette,
  setStoredColorPalette,
  type ColorPalette,
} from "./color-palette";
import {
  getAnchoredMenuPosition,
  getSubmenuPosition,
  type FloatingMenuPosition,
} from "./floating-menu";

type ActiveSubmenu = "theme" | "color" | null;

const MAIN_MENU_WIDTH = 240;
const MAIN_MENU_HEIGHT = 266;
const SUBMENU_WIDTH = 192;
const THEME_MENU_HEIGHT = 121;
const COLOR_MENU_HEIGHT = 265;

function MenuCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-4 w-4 items-center justify-center rounded-[3px] border",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-transparent",
      ].join(" ")}
    >
      <Check className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

function MenuOption({
  label,
  description,
  icon,
  selected,
  onClick,
  onPointerEnter,
}: {
  label: string;
  description?: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
  onPointerEnter?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={[
        "flex w-full items-center gap-3 rounded-[6px] px-2 py-2 text-left transition-colors",
        selected ? "bg-surface" : "hover:bg-surface",
      ].join(" ")}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-border bg-background text-foreground">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium leading-4 text-foreground">{label}</span>
        {description ? (
          <span className="block text-[10px] leading-4 text-muted">{description}</span>
        ) : null}
      </span>

      <MenuCheck selected={selected} />
    </button>
  );
}

export function SidebarProfileMenu() {
  const router = useRouter();
  const profile = useWorkspaceProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<ActiveSubmenu>(null);
  const [menuPosition, setMenuPosition] = useState<FloatingMenuPosition | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<FloatingMenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const colorMode = useColorMode();
  const colorPalette = getStoredColorPalette();
  const currentPalette = colorPaletteOptions.find((option) => option.value === colorPalette);

  useEffect(() => {
    applyColorPalette(colorPalette);
  }, [colorPalette]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      setMenuPosition(
        getAnchoredMenuPosition(
          rect,
          MAIN_MENU_WIDTH,
          window.innerWidth,
          window.innerHeight,
          MAIN_MENU_HEIGHT,
        ),
      );
    };

    const frame = window.requestAnimationFrame(updateMenuPosition);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        triggerRef.current &&
        menuRef.current &&
        submenuRef.current &&
        !triggerRef.current.contains(target) &&
        !menuRef.current.contains(target) &&
        !submenuRef.current.contains(target)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !activeSubmenu) {
      return;
    }

    const updateSubmenuPosition = () => {
      const anchor = activeSubmenu === "theme" ? themeButtonRef.current : colorButtonRef.current;

      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      setSubmenuPosition(
        getSubmenuPosition(
          rect,
          SUBMENU_WIDTH,
          activeSubmenu === "theme" ? THEME_MENU_HEIGHT : COLOR_MENU_HEIGHT,
          window.innerWidth,
          window.innerHeight,
        ),
      );
    };

    const frame = window.requestAnimationFrame(updateSubmenuPosition);

    window.addEventListener("resize", updateSubmenuPosition);
    window.addEventListener("scroll", updateSubmenuPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSubmenuPosition);
      window.removeEventListener("scroll", updateSubmenuPosition, true);
    };
  }, [activeSubmenu, isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    setActiveSubmenu(null);
    clearStoredGuestSession();

    if (profile.authType === "google") {
      void signOut({ callbackUrl: "/login" });
      return;
    }

    router.replace("/login");
  };

  const handleSelectColorMode = (nextMode: ColorMode) => {
    setStoredColorMode(nextMode);
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const handleSelectColorPalette = (nextPalette: ColorPalette) => {
    setStoredColorPalette(nextPalette);
    applyColorPalette(nextPalette);
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const mainMenu = isOpen && menuPosition && typeof document !== "undefined" ? (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Profile"
      className="fixed z-50 w-[240px] rounded-[10px] border border-border bg-background p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        width: `${menuPosition.width}px`,
      }}
    >
      <div className="flex flex-col items-center rounded-[8px] border border-border bg-surface px-3 py-3 text-center">
        <Avatar
          alt={profile.fullName}
          initials={profile.initials}
          src={profile.avatarUrl}
          sizeClassName="h-10 w-10"
          textClassName="text-[12px]"
        />
        <p className="mt-2 truncate text-[12px] font-medium leading-4 text-foreground">
          {profile.fullName}
        </p>
        <p className="truncate text-[11px] leading-4 text-muted">{profile.email}</p>
      </div>

      <div className="mt-1.5 space-y-1">
        <button
          ref={themeButtonRef}
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={activeSubmenu === "theme"}
          onPointerEnter={() => setActiveSubmenu("theme")}
          onClick={() => setActiveSubmenu((current) => (current === "theme" ? null : "theme"))}
          className="flex h-9 w-full items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
        >
          <SunMedium className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-left">Change Theme</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
        </button>

        <button
          ref={colorButtonRef}
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={activeSubmenu === "color"}
          onPointerEnter={() => setActiveSubmenu("color")}
          onClick={() => setActiveSubmenu((current) => (current === "color" ? null : "color"))}
          className="flex h-9 w-full items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
        >
          <span
            className="inline-flex h-3.5 w-3.5 shrink-0 rounded-[3px] border border-border"
            style={{
              backgroundColor: currentPalette?.color ?? "#3b82f6",
              borderColor: currentPalette?.color ?? "#3b82f6",
            }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 text-left">Color Mode</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
        </button>

        <Link
          href="/settings/profile"
          role="menuitem"
          onClick={() => {
            setIsOpen(false);
            setActiveSubmenu(null);
          }}
          className="flex h-9 items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
        >
          <Settings2 className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          Settings
        </Link>
      </div>

      <div className="my-1.5 h-px bg-border" />

      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="flex h-9 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Logout
      </button>
    </div>
  ) : null;

  const submenu =
    isOpen && activeSubmenu && submenuPosition && typeof document !== "undefined" ? (
      <div
        ref={submenuRef}
        role="menu"
        aria-label={activeSubmenu === "theme" ? "Theme" : "Color Mode"}
        className="fixed z-50 w-[192px] rounded-[10px] border border-border bg-background p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
        style={{
          top: submenuPosition.top,
          left: submenuPosition.left,
          width: `${submenuPosition.width}px`,
        }}
      >
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          {activeSubmenu === "theme" ? "Theme" : "Color Mode"}
        </div>

        <div className="space-y-1">
          {activeSubmenu === "theme"
            ? colorModeOptions.map((option) => {
                const selected = colorMode === option.value;
                const Icon = option.value === "light" ? SunMedium : MoonStar;

                return (
                  <MenuOption
                    key={option.value}
                    selected={selected}
                    icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                    label={option.label}
                    description={option.description}
                    onClick={() => handleSelectColorMode(option.value)}
                  />
                );
              })
            : colorPaletteOptions.map((option) => {
                const selected = colorPalette === option.value;

                return (
                  <MenuOption
                    key={option.value}
                    selected={selected}
                    icon={
                      <span
                        className="inline-flex h-3.5 w-3.5 rounded-[3px] border"
                        style={{
                          backgroundColor: option.color,
                          borderColor: option.color,
                        }}
                      />
                    }
                    label={option.label}
                    onClick={() => handleSelectColorPalette(option.value)}
                  />
                );
              })}
        </div>
      </div>
    ) : null;

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
        <Avatar
          alt={profile.fullName}
          initials={profile.initials}
          src={profile.avatarUrl}
          sizeClassName="h-7 w-7"
          textClassName="text-[11px]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold leading-4 text-foreground">
            {profile.fullName}
          </p>
          <p className="truncate text-[10px] leading-4 text-muted">{profile.title}</p>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      </button>

      {mainMenu}
      {submenu}
    </div>
  );
}
