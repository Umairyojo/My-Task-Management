"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredGuestSession } from "./guest-session";

function HomeRedirectSkeleton() {
  return <div className="min-h-dvh bg-background" />;
}

export function HomeRedirect() {
  const router = useRouter();
  const guestSession = getStoredGuestSession();

  useEffect(() => {
    router.replace(guestSession ? "/tasks" : "/login");
  }, [guestSession, router]);

  return <HomeRedirectSkeleton />;
}
