"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { GoogleMark } from "@/components/layout/app-icons";
import {
  createGuestSession,
  setStoredGuestSession,
  useGuestSession,
} from "./guest-session";

function LoginSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full justify-center">
          <div className="h-7 w-28 rounded-full bg-surface/70 animate-pulse" />
        </div>
        <div className="mt-6 w-full max-w-[384px] rounded-[24px] border border-border bg-background p-6">
          <div className="h-[202px] w-full rounded-[18px] bg-surface/60 animate-pulse" />
        </div>
        <div className="mt-4 h-12 w-full max-w-[384px] rounded-[4px] bg-surface/60 animate-pulse" />
      </div>
    </div>
  );
}

export function LoginView() {
  const router = useRouter();
  const { status } = useSession();
  const guestSession = useGuestSession();
  const isAuthorized = status === "authenticated" || guestSession !== null;

  useEffect(() => {
    if (isAuthorized) {
      router.replace("/tasks");
    }
  }, [isAuthorized, router]);

  const handleGuestLogin = () => {
    setStoredGuestSession(createGuestSession());
    router.replace("/tasks");
  };

  const handleGoogleLogin = () => {
    void signIn("google", {
      callbackUrl: "/tasks",
    });
  };

  if (status === "loading" && !guestSession) {
    return <LoginSkeleton />;
  }

  if (isAuthorized) {
    return <LoginSkeleton />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full justify-center">
          <div className="flex h-6 items-center gap-2">
            <img
              src="/pyramid.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6 shrink-0"
            />
            <p className="text-[18px] font-semibold leading-6 tracking-[-0.03em] text-foreground">
              Pyramid
            </p>
          </div>
        </div>

        <div className="mt-6 w-full max-w-[384px] rounded-[24px] border border-border bg-background px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h1 className="text-center text-[18px] font-semibold leading-6 tracking-[-0.03em] text-foreground">
            Let&apos;s get back on track
          </h1>
          <p className="mt-1 text-center text-[12px] leading-5 text-muted">
            Enter your email below to login to your account.
          </p>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:opacity-90"
            >
              Continue as Guest
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={status === "loading"}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark className="h-4 w-4" />
              Login with Google
            </button>
          </div>
        </div>

        <p className="mt-4 w-full max-w-[384px] text-center text-[11px] leading-4 text-muted">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
