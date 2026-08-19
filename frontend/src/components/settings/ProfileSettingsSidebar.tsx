"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Search, Square, SunMedium, UserRound } from "lucide-react";

type SidebarItemProps = {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  href?: string;
};

function SidebarItem({ active = false, icon: Icon, label, href }: SidebarItemProps) {
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

export function ProfileSettingsSidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-4 py-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to app
        </Link>
      </div>

      <div className="px-3 py-3">
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
          <SidebarItem icon={SunMedium} label="Theme" />
          <SidebarItem icon={Square} label="Color" />
        </nav>
      </div>
    </aside>
  );
}
