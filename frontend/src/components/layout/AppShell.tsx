import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
