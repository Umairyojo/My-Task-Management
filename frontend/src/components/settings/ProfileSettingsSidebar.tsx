"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MoonStar,
  Search,
  Settings2,
  SunMedium,
  UserRound,
} from "lucide-react";
import {
  colorModeOptions,
  type ColorMode,
  setStoredColorMode,
} from "@/components/layout/color-mode";
import {
  applyColorPalette,
  colorPaletteOptions,
  getStoredColorPalette,
  type ColorPalette,
  setStoredColorPalette,
} from "@/components/layout/color-palette";
import {
  getSubmenuPosition,
  type FloatingMenuPosition,
} from "@/components/layout/floating-menu";
import { useColorMode } from "@/components/layout/use-color-mode";

type OpenPopover = "theme" | "color" | null;

const THEME_MENU_HEIGHT = 121;
const COLOR_MENU_HEIGHT = 265;

function SidebarItem({
  active = false,
  icon,
  label,
  href,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
  href?: string;
}) {
  const className = [
    "flex h-9 items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium transition-colors",
    active ? "bg-accent-soft text-foreground" : "text-foreground hover:bg-surface",
  ].join(" ");

  const content = (
    <>
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-foreground">
        {icon}
      </span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link aria-current={active ? "page" : undefined} className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

function SubmenuOption({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={[
        "flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[12px] text-foreground transition-colors",
        selected ? "bg-accent-soft" : "hover:bg-surface",
      ].join(" ")}
    >
      <span className="flex h-4 w-4 items-center justify-center text-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={[
          "inline-flex h-4 w-4 items-center justify-center rounded-[3px] border",
          selected
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-background text-transparent",
        ].join(" ")}
      >
        <Check className="h-3 w-3" aria-hidden="true" />
      </span>
    </button>
  );
}

function containsAny(target: Node, refs: Array<React.RefObject<HTMLElement | null>>) {
  return refs.some((ref) => ref.current && ref.current.contains(target));
}

export function ProfileSettingsSidebar() {
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(() =>
    getStoredColorPalette(),
  );
  const [themePopoverPosition, setThemePopoverPosition] =
    useState<FloatingMenuPosition | null>(null);
  const [colorPopoverPosition, setColorPopoverPosition] =
    useState<FloatingMenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const themePopoverRef = useRef<HTMLDivElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const colorMode = useColorMode();

  useEffect(() => {
    applyColorPalette(colorPalette);
  }, [colorPalette]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !containsAny(target, [menuRef, themePopoverRef, colorPopoverRef])
      ) {
        setOpenPopover(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPopover(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!openPopover) {
      return;
    }

    const updatePositions = () => {
      const themeAnchor = themeButtonRef.current;
      const colorAnchor = colorButtonRef.current;

      if (openPopover === "theme" && themeAnchor) {
        setThemePopoverPosition(
          getSubmenuPosition(
            themeAnchor.getBoundingClientRect(),
            192,
            THEME_MENU_HEIGHT,
            window.innerWidth,
            window.innerHeight,
          ),
        );
      }

      if (openPopover === "color" && colorAnchor) {
        setColorPopoverPosition(
          getSubmenuPosition(
            colorAnchor.getBoundingClientRect(),
            192,
            COLOR_MENU_HEIGHT,
            window.innerWidth,
            window.innerHeight,
          ),
        );
      }
    };

    const frame = window.requestAnimationFrame(updatePositions);
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [openPopover]);

  const handleSelectColorMode = (nextMode: ColorMode) => {
    setStoredColorMode(nextMode);
    setOpenPopover(null);
  };

  const handleSelectColorPalette = (nextPalette: ColorPalette) => {
    setColorPalette(nextPalette);
    setStoredColorPalette(nextPalette);
    setOpenPopover(null);
  };

  const currentPalette = colorPaletteOptions.find((option) => option.value === colorPalette);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-3.5 py-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to app
        </Link>
      </div>

      <div ref={menuRef} className="relative flex-1 overflow-y-auto px-3 py-2.5">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            aria-label="Search settings"
            readOnly
            value=""
            placeholder="Search"
            className="h-8 w-full rounded-[4px] border border-border bg-background pl-8 pr-2 text-[12px] text-foreground outline-none placeholder:text-muted"
          />
        </label>

        <nav aria-label="Profile settings" className="mt-2 space-y-1">
          <SidebarItem
            active
            href="/settings/profile"
            icon={<UserRound className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Profile"
          />

          <button
            ref={themeButtonRef}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={openPopover === "theme"}
            onPointerEnter={() => setOpenPopover("theme")}
            onClick={() =>
              setOpenPopover((current) => (current === "theme" ? null : "theme"))
            }
            className="flex h-9 w-full items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            <SunMedium className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-left">Theme</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          </button>

          <button
            ref={colorButtonRef}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={openPopover === "color"}
            onPointerEnter={() => setOpenPopover("color")}
            onClick={() =>
              setOpenPopover((current) => (current === "color" ? null : "color"))
            }
            className="flex h-9 w-full items-center gap-2 rounded-[6px] px-2 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            <span
              className="inline-flex h-3.5 w-3.5 shrink-0 rounded-[3px] border"
              style={{
                backgroundColor: currentPalette?.color ?? "#3b82f6",
                borderColor: currentPalette?.color ?? "#3b82f6",
              }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 text-left">Color</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          </button>
        </nav>

        {openPopover === "theme" && themePopoverPosition ? (
          <div
            ref={themePopoverRef}
            role="menu"
            aria-label="Theme"
            className="fixed z-20 w-[192px] rounded-[10px] border border-border bg-background p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
            style={{
              top: themePopoverPosition.top,
              left: themePopoverPosition.left,
              width: `${themePopoverPosition.width}px`,
            }}
          >
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              Theme
            </p>
            <div className="space-y-1">
              {colorModeOptions.map((option) => {
                const selected = colorMode === option.value;
                const Icon = option.value === "light" ? SunMedium : MoonStar;

                return (
                  <SubmenuOption
                    key={option.value}
                    selected={selected}
                    icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                    label={option.label}
                    onClick={() => handleSelectColorMode(option.value)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {openPopover === "color" && colorPopoverPosition ? (
          <div
            ref={colorPopoverRef}
            role="menu"
            aria-label="Color Mode"
            className="fixed z-20 w-[192px] rounded-[10px] border border-border bg-background p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
            style={{
              top: colorPopoverPosition.top,
              left: colorPopoverPosition.left,
              width: `${colorPopoverPosition.width}px`,
            }}
          >
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              Color Mode
            </p>
            <div className="space-y-1">
              {colorPaletteOptions.map((option) => {
                const selected = colorPalette === option.value;

                return (
                  <SubmenuOption
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
        ) : null}

        <nav aria-label="Settings actions" className="mt-1">
          <SidebarItem
            icon={<Settings2 className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Settings"
            href="/settings/profile"
          />
          <div className="my-1.5 h-px bg-border" />
          <SidebarItem
            icon={<ChevronRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />}
            label="Logout"
          />
        </nav>
      </div>
    </aside>
  );
}
