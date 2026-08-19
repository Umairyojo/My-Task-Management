"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getStoredGuestSession } from "./guest-session";

interface WorkspaceAuthGateProps {
  children: ReactNode;
}

function WorkspaceLoadingState() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background text-foreground">
      <div className="rounded-[14px] border border-border bg-surface px-5 py-4 text-[12px] font-medium text-muted">
        Restoring workspace...
      </div>
    </div>
  );
}

export function WorkspaceAuthGate({ children }: WorkspaceAuthGateProps) {
  const router = useRouter();
  const guestSession = getStoredGuestSession();

  useEffect(() => {
    if (!guestSession) {
      router.replace("/login");
    }
  }, [guestSession, router]);

  if (!guestSession) {
    return <WorkspaceLoadingState />;
  }

  return <AppShell>{children}</AppShell>;
}
