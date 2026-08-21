"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileSidebarOpenPath, setMobileSidebarOpenPath] = useState<string | null>(null);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const isMobileSidebarOpen = mobileSidebarOpenPath === pathname;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsDesktopSidebarCollapsed(
        window.localStorage.getItem("workspace-sidebar-collapsed") === "true",
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      window.localStorage.setItem("workspace-sidebar-collapsed", String(nextCollapsed));
      return nextCollapsed;
    });
  };

  return (
    <div className="flex min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
      {!isDesktopSidebarCollapsed ? (
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
      ) : null}

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileSidebarOpenPath(null)}
          />
          <div className="relative z-10 flex h-full w-64 flex-col bg-sidebar">
            <div className="flex h-12 items-center justify-end border-b border-border px-3.5">
              <button
                type="button"
                onClick={() => setMobileSidebarOpenPath(null)}
                aria-label="Close navigation"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-foreground"
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
        <div className="hidden h-12 shrink-0 items-center border-b border-border px-4 lg:flex">
          <button
            type="button"
            onClick={toggleDesktopSidebar}
            aria-label={isDesktopSidebarCollapsed ? "Show workspace sidebar" : "Hide workspace sidebar"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            {isDesktopSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="flex h-12 items-center justify-between border-b border-border px-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpenPath(pathname)}
            aria-label="Open navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-foreground"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-[11px] font-medium text-muted">Menu</span>
        </div>

        <div className="app-page-canvas flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
