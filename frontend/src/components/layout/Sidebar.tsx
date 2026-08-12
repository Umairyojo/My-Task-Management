"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground ring-1 ring-border">
            D
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Dexter
            </p>
            <p className="text-xs text-zinc-500">Workspace</p>
          </div>
        </div>
      </div>

      <nav aria-label="Workspace" className="flex-1 px-4 py-4">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
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
                    "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-background text-foreground ring-1 ring-border"
                      : "text-zinc-600 hover:bg-background/70 hover:text-foreground",
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
