"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ColorModeSync } from "@/components/layout/ColorModeSync";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <ColorModeSync />
    </SessionProvider>
  );
}
