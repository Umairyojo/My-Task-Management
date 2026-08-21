"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProjectsMark, TasksMark } from "./app-icons";
import { SidebarProfileMenu } from "./SidebarProfileMenu";

const navigationItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/projects", label: "Projects" },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-3.5 py-3">
        <SidebarProfileMenu />
      </div>

      <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-3 py-2">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen((current) => !current)}
          aria-expanded={isWorkspaceOpen}
          className="flex h-9 w-full items-center justify-between rounded-[6px] px-2 text-[12px] font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <span className="uppercase tracking-[0.16em]">Workspace</span>
          <ChevronDown
            className={[
              "h-3.5 w-3.5 shrink-0 transition-transform",
              isWorkspaceOpen ? "rotate-0" : "-rotate-90",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>

        {isWorkspaceOpen ? (
          <ul className="mt-1 space-y-1">
            {navigationItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.href === "/tasks" ? TasksMark : ProjectsMark;

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex h-9 items-center gap-2 rounded-[6px] px-3 text-[12px] font-medium transition-colors",
                      active
                        ? "bg-accent-soft text-foreground ring-1 ring-inset ring-accent/20"
                        : "text-muted hover:bg-background hover:text-foreground",
                    ].join(" ")}
                    href={item.href}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </nav>
    </aside>
  );
}
