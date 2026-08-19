export interface GuestSession {
  name: string;
  initials: string;
}

export const GUEST_SESSION_STORAGE_KEY = "task-management-guest-session";
export const GUEST_SESSION_CHANGE_EVENT = "task-management-guest-session-change";

const defaultGuestSession: GuestSession = {
  name: "Dexter",
  initials: "D",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getDefaultGuestSession(): GuestSession {
  return defaultGuestSession;
}

export function getStoredGuestSession(): GuestSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(GUEST_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      isRecord(parsed) &&
      typeof parsed.name === "string" &&
      typeof parsed.initials === "string" &&
      parsed.name.trim().length > 0 &&
      parsed.initials.trim().length > 0
    ) {
      const name = parsed.name.trim();
      const initials = parsed.initials.trim();

      if (name === "Guest" && initials === "G") {
        return defaultGuestSession;
      }

      return {
        name,
        initials,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function setStoredGuestSession(session: GuestSession): void {
  window.localStorage.setItem(
    GUEST_SESSION_STORAGE_KEY,
    JSON.stringify({
      name: session.name.trim() || defaultGuestSession.name,
      initials: session.initials.trim() || defaultGuestSession.initials,
    }),
  );
  window.dispatchEvent(new Event(GUEST_SESSION_CHANGE_EVENT));
}

export function clearStoredGuestSession(): void {
  window.localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(GUEST_SESSION_CHANGE_EVENT));
}
