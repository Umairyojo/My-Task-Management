import { useSyncExternalStore } from "react";

export interface GuestSession {
  id: string;
  email: string;
  name: string;
  initials: string;
}

export interface GuestIdentity {
  name: string;
  initials: string;
}

export const DEFAULT_GUEST_IDENTITY: GuestIdentity = {
  name: "Guest User",
  initials: "GU",
};

export const GUEST_SESSION_STORAGE_KEY = "task-management-guest-session";
export const GUEST_SESSION_CHANGE_EVENT = "task-management-guest-session-change";

const LEGACY_DEFAULT_GUEST_NAME = "Dexter";
const LEGACY_DEFAULT_GUEST_INITIALS = "D";

let cachedGuestSessionRaw: string | null | undefined = undefined;
let cachedGuestSessionSnapshot: GuestSession | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getGuestEmail(id: string): string {
  return `guest-${id.slice(0, 8)}@ablespace.local`;
}

function normalizeGuestIdentity(identity: Partial<GuestIdentity>): GuestIdentity {
  const name = identity.name?.trim() || DEFAULT_GUEST_IDENTITY.name;
  const initials = identity.initials?.trim() || DEFAULT_GUEST_IDENTITY.initials;

  return {
    name,
    initials: initials.toUpperCase().slice(0, 2),
  };
}

export function createGuestSession(
  identity: Partial<GuestIdentity> = {},
): GuestSession {
  const normalizedIdentity = normalizeGuestIdentity(identity);
  const id = getGuestId();

  return {
    id,
    email: getGuestEmail(id),
    name: normalizedIdentity.name,
    initials: normalizedIdentity.initials,
  };
}

export function getStoredGuestSession(): GuestSession | null {
  if (typeof window === "undefined") {
    return cachedGuestSessionSnapshot;
  }

  const rawValue = window.sessionStorage.getItem(GUEST_SESSION_STORAGE_KEY);

  if (rawValue === cachedGuestSessionRaw) {
    return cachedGuestSessionSnapshot;
  }

  if (!rawValue) {
    cachedGuestSessionRaw = null;
    cachedGuestSessionSnapshot = null;
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      isRecord(parsed) &&
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.initials === "string" &&
      parsed.id.trim().length > 0 &&
      parsed.email.trim().length > 0 &&
      parsed.name.trim().length > 0 &&
      parsed.initials.trim().length > 0
    ) {
      const isLegacyDefaultGuest =
        parsed.name.trim() === LEGACY_DEFAULT_GUEST_NAME &&
        parsed.initials.trim().toUpperCase() === LEGACY_DEFAULT_GUEST_INITIALS;
      const nextSession: GuestSession = {
        id: parsed.id.trim(),
        email: parsed.email.trim(),
        name: isLegacyDefaultGuest
          ? DEFAULT_GUEST_IDENTITY.name
          : parsed.name.trim(),
        initials: isLegacyDefaultGuest
          ? DEFAULT_GUEST_IDENTITY.initials
          : parsed.initials.trim().toUpperCase().slice(0, 2),
      };

      const nextRawValue = JSON.stringify(nextSession);

      if (isLegacyDefaultGuest) {
        window.sessionStorage.setItem(GUEST_SESSION_STORAGE_KEY, nextRawValue);
      }

      cachedGuestSessionRaw = nextRawValue;
      cachedGuestSessionSnapshot = nextSession;

      return nextSession;
    }
  } catch {
    cachedGuestSessionRaw = null;
    cachedGuestSessionSnapshot = null;
    return null;
  }

  cachedGuestSessionRaw = null;
  cachedGuestSessionSnapshot = null;
  return null;
}

export function setStoredGuestSession(session: GuestSession): void {
  const nextId = session.id.trim() || getGuestId();
  const nextSession: GuestSession = {
    id: nextId,
    email: session.email.trim() || getGuestEmail(nextId),
    name: session.name.trim() || DEFAULT_GUEST_IDENTITY.name,
    initials:
      session.initials.trim().toUpperCase().slice(0, 2) ||
      DEFAULT_GUEST_IDENTITY.initials,
  };

  const rawValue = JSON.stringify(nextSession);

  window.sessionStorage.setItem(GUEST_SESSION_STORAGE_KEY, rawValue);
  cachedGuestSessionRaw = rawValue;
  cachedGuestSessionSnapshot = nextSession;
  window.dispatchEvent(new Event(GUEST_SESSION_CHANGE_EVENT));
}

export function clearStoredGuestSession(): void {
  window.sessionStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
  cachedGuestSessionRaw = null;
  cachedGuestSessionSnapshot = null;
  window.dispatchEvent(new Event(GUEST_SESSION_CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  const handleChange = () => {
    cachedGuestSessionRaw = undefined;
    callback();
  };

  window.addEventListener(GUEST_SESSION_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener(GUEST_SESSION_CHANGE_EVENT, handleChange);
  };
}

export function useGuestSession(): GuestSession | null {
  return useSyncExternalStore(
    subscribe,
    getStoredGuestSession,
    () => null,
  );
}
