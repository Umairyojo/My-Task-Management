"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
  MoonStar,
  Search,
  Square,
  SunMedium,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyColorMode,
  colorModeOptions,
  getStoredColorMode,
  type ColorMode,
  setStoredColorMode,
} from "@/components/layout/color-mode";

type SidebarItemProps = {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  href?: string;
};

function SidebarItem({
  active = false,
  icon: Icon,
  label,
  href,
}: SidebarItemProps) {
  const className = [
    "flex h-8 items-center gap-2 rounded-[4px] px-2 text-[12px] font-medium transition-colors",
    active ? "bg-surface text-foreground" : "text-foreground hover:bg-surface",
  ].join(" ");

  const content = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden="true" />
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

function ThemeOption({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left transition-colors",
        selected ? "bg-surface" : "hover:bg-surface",
      ].join(" ")}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-border bg-background text-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium leading-4 text-foreground">
          {label}
        </span>
        <span className="block text-[10px] leading-4 text-muted">{description}</span>
      </span>

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
    </button>
  );
}

export function ProfileSettingsSidebar() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => getStoredColorMode());

  useEffect(() => {
    applyColorMode(colorMode);
  }, [colorMode]);

  const handleSelectColorMode = (nextMode: ColorMode) => {
    setColorMode(nextMode);
    setStoredColorMode(nextMode);
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-4 py-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to app
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
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
          <SidebarItem active href="/settings/profile" icon={UserRound} label="Profile" />
        </nav>

        <section className="mt-5 px-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Theme
          </p>
          <div className="mt-2 space-y-1">
            {colorModeOptions.map((option) => {
              const Icon = option.value === "light" ? SunMedium : MoonStar;

              return (
                <ThemeOption
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  icon={Icon}
                  selected={colorMode === option.value}
                  onSelect={() => handleSelectColorMode(option.value)}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-4 px-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Color
          </p>
          <div className="mt-2 flex h-9 items-center gap-2 rounded-[8px] border border-border bg-background px-2 text-[12px] text-muted">
            <span className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-foreground text-background">
              <Square className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
            <span>Default palette</span>
          </div>
        </section>
      </div>
    </aside>
  );
}
