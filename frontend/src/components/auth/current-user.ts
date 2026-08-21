"use client";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { DEFAULT_GUEST_IDENTITY, type GuestSession, useGuestSession } from "./guest-session";

export type CurrentUserAuthType = "google" | "guest";

export interface CurrentUserIdentity {
  authType: CurrentUserAuthType;
  id: string;
  name: string;
  email: string;
  initials: string;
  image: string | null;
}

function getInitials(value: string): string {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return DEFAULT_GUEST_IDENTITY.initials;
  }

  return parts
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveGoogleIdentity(
  sessionUser: Session["user"] | null | undefined,
): CurrentUserIdentity | null {
  if (!sessionUser?.email) {
    return null;
  }

  const name = sessionUser.name?.trim() || sessionUser.email.split("@")[0];

  return {
    authType: "google",
    id: `google:${sessionUser.email.toLowerCase()}`,
    name,
    email: sessionUser.email,
    initials: getInitials(name),
    image: sessionUser.image ?? null,
  };
}

function resolveGuestIdentity(guestSession: GuestSession | null): CurrentUserIdentity | null {
  if (!guestSession) {
    return null;
  }

  return {
    authType: "guest",
    id: `guest:${guestSession.id}`,
    name: guestSession.name,
    email: guestSession.email,
    initials: guestSession.initials,
    image: null,
  };
}

export function useCurrentUserIdentity(): CurrentUserIdentity | null {
  const { data: session, status } = useSession();
  const guestSession = useGuestSession();

  if (status === "authenticated") {
    return resolveGoogleIdentity(session?.user ?? null);
  }

  return resolveGuestIdentity(guestSession);
}
