"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-4 py-3">
        <SidebarProfileMenu />
      </div>

      <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-3 py-2.5">
        <p className="px-2 pb-2 text-[10px] font-medium leading-4 text-muted">
          Workspace
        </p>
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex h-9 items-center rounded-lg px-3 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-surface text-foreground"
                      : "text-muted hover:bg-background hover:text-foreground",
                  ].join(" ")}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
