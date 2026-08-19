"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpenPath, setMobileSidebarOpenPath] = useState<string | null>(null);
  const isMobileSidebarOpen = mobileSidebarOpenPath === pathname;

  return (
    <div className="flex min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileSidebarOpenPath(null)}
          />
          <div className="relative z-10 flex h-full w-64 flex-col bg-sidebar">
            <div className="flex h-14 items-center justify-end border-b border-border px-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpenPath(null)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-border bg-background text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <Sidebar />
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpenPath(pathname)}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-border bg-background text-foreground"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-[12px] font-medium text-muted">Menu</span>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-6 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
