"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGuestSession } from "./guest-session";

function HomeRedirectSkeleton() {
  return <div className="min-h-dvh bg-background" />;
}

export function HomeRedirect() {
  const router = useRouter();
  const { status } = useSession();
  const guestSession = useGuestSession();
  const isAuthorized = status === "authenticated" || guestSession !== null;

  useEffect(() => {
    if (status === "loading" && guestSession === null) {
      return;
    }

    router.replace(isAuthorized ? "/tasks" : "/login");
  }, [guestSession, isAuthorized, router, status]);

  return <HomeRedirectSkeleton />;
}
