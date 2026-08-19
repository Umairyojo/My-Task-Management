"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import {
  createGuestSession,
  getStoredGuestSession,
  setStoredGuestSession,
} from "./guest-session";

function GoogleGlyph() {
  return (
    <span className="relative inline-flex h-4 w-4 overflow-hidden rounded-full border border-border bg-background">
      <span className="absolute left-0 top-0 h-2 w-2 bg-[#4285F4]" />
      <span className="absolute right-0 top-0 h-2 w-2 bg-[#EA4335]" />
      <span className="absolute bottom-0 left-0 h-2 w-2 bg-[#FBBC05]" />
      <span className="absolute bottom-0 right-0 h-2 w-2 bg-[#34A853]" />
    </span>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="h-[520px] w-full max-w-[520px] rounded-[24px] border border-border bg-surface/60" />
    </div>
  );
}

export function LoginView() {
  const router = useRouter();
  const guestSession = getStoredGuestSession();

  useEffect(() => {
    if (guestSession) {
      router.replace("/tasks");
    }
  }, [guestSession, router]);

  const handleGuestLogin = () => {
    setStoredGuestSession(createGuestSession());
    router.replace("/tasks");
  };

  if (guestSession) {
    return <LoginSkeleton />;
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-surface blur-3xl" />
        <div className="absolute right-[-5rem] top-[-3rem] h-80 w-80 rounded-full bg-surface/70 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-background shadow-[0_0_120px_rgba(0,0,0,0.03)]" />
      </div>

      <div className="relative z-10 w-full max-w-[520px] rounded-[28px] border border-border bg-background p-6 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-border bg-surface text-[14px] font-semibold text-foreground">
            AS
          </div>
          <div>
            <p className="text-[18px] font-semibold leading-5 text-foreground">
              AbleSpace
            </p>
            <p className="text-[12px] leading-4 text-muted">Task management workspace</p>
          </div>
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Guest access
          </div>

          <h1 className="mt-5 text-[34px] font-semibold tracking-[-0.04em] text-foreground">
            Let&apos;s get back on track
          </h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-6 text-muted">
            Enter the workspace as a guest to review tasks, projects, and the current
            app layout.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:opacity-90"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Continue as Guest
          </button>

          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-border bg-background px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            <GoogleGlyph />
            Continue with Google
            <span className="text-[11px] font-normal text-muted">(visual only)</span>
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] leading-5 text-muted">
          By continuing, you agree to the{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Terms
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
