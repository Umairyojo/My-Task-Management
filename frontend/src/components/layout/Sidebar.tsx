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
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-[12px] font-semibold text-foreground ring-1 ring-border">
            D
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-5 text-foreground">
              Dexter
            </p>
            <p className="text-[11px] leading-4 text-muted">Workspace</p>
          </div>
        </div>
      </div>

      <nav aria-label="Workspace" className="flex-1 px-3 py-3">
        <p className="px-2 pb-2 text-[11px] font-medium leading-4 text-muted">
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
