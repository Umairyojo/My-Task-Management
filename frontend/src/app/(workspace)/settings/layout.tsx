import type { ReactNode } from "react";
import { ProfileSettingsSidebar } from "@/components/settings/ProfileSettingsSidebar";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="hidden lg:flex">
        <ProfileSettingsSidebar />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
