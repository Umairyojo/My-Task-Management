"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

const WorkspaceAuthGate = dynamic(
  () =>
    import("@/components/auth/WorkspaceAuthGate").then(
      (module) => module.WorkspaceAuthGate,
    ),
  {
    ssr: false,
  },
);

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <WorkspaceAuthGate>
      <AppShell>{children}</AppShell>
    </WorkspaceAuthGate>
  );
}
