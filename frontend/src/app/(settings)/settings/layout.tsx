"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ProfileSettingsSidebar } from "@/components/settings/ProfileSettingsSidebar";

const WorkspaceAuthGate = dynamic(
  () =>
    import("@/components/auth/WorkspaceAuthGate").then(
      (module) => module.WorkspaceAuthGate,
    ),
  {
    ssr: false,
  },
);

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <WorkspaceAuthGate>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
        <div className="hidden lg:flex">
          <ProfileSettingsSidebar />
        </div>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </WorkspaceAuthGate>
  );
}
