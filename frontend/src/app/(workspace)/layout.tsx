"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

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
  return <WorkspaceAuthGate>{children}</WorkspaceAuthGate>;
}
