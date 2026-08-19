import { useSyncExternalStore } from "react";
import {
  DEFAULT_GUEST_IDENTITY,
  GUEST_SESSION_CHANGE_EVENT,
  getStoredGuestSession,
  setStoredGuestSession,
} from "./guest-session";

export interface WorkspaceProfile {
  fullName: string;
  title: string;
  username: string;
  email: string;
  initials: string;
}

export interface WorkspaceProfileFormValues {
  fullName: string;
  title: string;
  username: string;
}

const DEFAULT_WORKSPACE_EMAIL = "guest@ablespace.local";
const DEFAULT_WORKSPACE_PROFILE: WorkspaceProfile = {
  fullName: DEFAULT_GUEST_IDENTITY.name,
  title: "Designer",
  username: "Dexuser",
  email: DEFAULT_WORKSPACE_EMAIL,
  initials: DEFAULT_GUEST_IDENTITY.initials,
};

const WORKSPACE_PROFILE_STORAGE_KEY_PREFIX = "task-management-workspace-profile";
const LEGACY_WORKSPACE_PROFILE_STORAGE_KEY =
  "task-management-workspace-profile";
export const WORKSPACE_PROFILE_CHANGE_EVENT =
  "task-management-workspace-profile-change";

let cachedWorkspaceProfileKey: string | null | undefined = undefined;
let cachedWorkspaceProfileRaw: string | null | undefined = undefined;
let cachedWorkspaceProfileSnapshot: WorkspaceProfile = DEFAULT_WORKSPACE_PROFILE;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function getWorkspaceProfileStorageKey(sessionId: string): string {
  return `${WORKSPACE_PROFILE_STORAGE_KEY_PREFIX}:${sessionId}`;
}

function normalizeStoredEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return DEFAULT_WORKSPACE_EMAIL;
  }

  return trimmedEmail;
}

function createProfileFromSession(): WorkspaceProfile {
  const guestSession = getStoredGuestSession();

  if (!guestSession) {
    return DEFAULT_WORKSPACE_PROFILE;
  }

  return {
    fullName: guestSession.name,
    title: DEFAULT_WORKSPACE_PROFILE.title,
    username: DEFAULT_WORKSPACE_PROFILE.username,
    email: guestSession.email,
    initials: guestSession.initials,
  };
}

function parseWorkspaceProfile(rawValue: string): WorkspaceProfile | null {
  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      isRecord(parsed) &&
      typeof parsed.fullName === "string" &&
      typeof parsed.title === "string" &&
      typeof parsed.username === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.initials === "string" &&
      parsed.fullName.trim().length > 0 &&
      parsed.username.trim().length > 0 &&
      parsed.email.trim().length > 0 &&
      parsed.initials.trim().length > 0
    ) {
      return {
        fullName: parsed.fullName.trim(),
        title: parsed.title.trim() || DEFAULT_WORKSPACE_PROFILE.title,
        username: parsed.username.trim(),
        email: normalizeStoredEmail(parsed.email),
        initials: parsed.initials.trim().toUpperCase().slice(0, 2),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function invalidateWorkspaceProfileCache(): void {
  cachedWorkspaceProfileKey = undefined;
  cachedWorkspaceProfileRaw = undefined;
}

export function createDefaultWorkspaceProfile(): WorkspaceProfile {
  return DEFAULT_WORKSPACE_PROFILE;
}

export function toWorkspaceProfile(
  values: WorkspaceProfileFormValues,
  currentEmail: string = DEFAULT_WORKSPACE_EMAIL,
): WorkspaceProfile {
  const fullName = values.fullName.trim() || DEFAULT_GUEST_IDENTITY.name;
  const title = values.title.trim() || DEFAULT_WORKSPACE_PROFILE.title;
  const username = values.username.trim() || DEFAULT_WORKSPACE_PROFILE.username;

  return {
    fullName,
    title,
    username,
    email: normalizeStoredEmail(currentEmail),
    initials: getInitials(fullName),
  };
}

export function getStoredWorkspaceProfile(): WorkspaceProfile {
  if (typeof window === "undefined") {
    return cachedWorkspaceProfileSnapshot;
  }

  const guestSession = getStoredGuestSession();

  if (!guestSession) {
    cachedWorkspaceProfileKey = null;
    cachedWorkspaceProfileRaw = null;
    cachedWorkspaceProfileSnapshot = DEFAULT_WORKSPACE_PROFILE;
    return cachedWorkspaceProfileSnapshot;
  }

  const storageKey = getWorkspaceProfileStorageKey(guestSession.id);
  const rawValue = window.localStorage.getItem(storageKey);

  if (storageKey === cachedWorkspaceProfileKey && rawValue === cachedWorkspaceProfileRaw) {
    return cachedWorkspaceProfileSnapshot;
  }

  if (rawValue) {
    const nextProfile = parseWorkspaceProfile(rawValue);

    if (nextProfile) {
      cachedWorkspaceProfileKey = storageKey;
      cachedWorkspaceProfileRaw = rawValue;
      cachedWorkspaceProfileSnapshot = nextProfile;
      return nextProfile;
    }
  }

  const legacyRawValue = window.localStorage.getItem(
    LEGACY_WORKSPACE_PROFILE_STORAGE_KEY,
  );

  if (legacyRawValue) {
    const legacyProfile = parseWorkspaceProfile(legacyRawValue);

    if (legacyProfile) {
      const migratedRaw = JSON.stringify(legacyProfile);
      window.localStorage.setItem(storageKey, migratedRaw);
      cachedWorkspaceProfileKey = storageKey;
      cachedWorkspaceProfileRaw = migratedRaw;
      cachedWorkspaceProfileSnapshot = legacyProfile;
      return legacyProfile;
    }
  }

  const nextProfile = createProfileFromSession();
  const nextRaw = JSON.stringify(nextProfile);
  window.localStorage.setItem(storageKey, nextRaw);
  cachedWorkspaceProfileKey = storageKey;
  cachedWorkspaceProfileRaw = nextRaw;
  cachedWorkspaceProfileSnapshot = nextProfile;
  return nextProfile;
}

export function setStoredWorkspaceProfile(
  values: WorkspaceProfileFormValues,
): WorkspaceProfile {
  const currentSession = getStoredGuestSession();

  if (!currentSession) {
    return DEFAULT_WORKSPACE_PROFILE;
  }

  const currentProfile = getStoredWorkspaceProfile();
  const nextProfile = toWorkspaceProfile(values, currentProfile.email);
  const storageKey = getWorkspaceProfileStorageKey(currentSession.id);
  const nextRaw = JSON.stringify(nextProfile);

  window.localStorage.setItem(storageKey, nextRaw);
  cachedWorkspaceProfileKey = storageKey;
  cachedWorkspaceProfileRaw = nextRaw;
  cachedWorkspaceProfileSnapshot = nextProfile;

  setStoredGuestSession({
    ...currentSession,
    name: nextProfile.fullName,
    initials: nextProfile.initials,
  });
  window.dispatchEvent(new Event(WORKSPACE_PROFILE_CHANGE_EVENT));

  return nextProfile;
}

function subscribe(callback: () => void): () => void {
  const handleInvalidate = () => {
    invalidateWorkspaceProfileCache();
    callback();
  };

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === LEGACY_WORKSPACE_PROFILE_STORAGE_KEY ||
      event.key?.startsWith(`${WORKSPACE_PROFILE_STORAGE_KEY_PREFIX}:`) === true
    ) {
      handleInvalidate();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WORKSPACE_PROFILE_CHANGE_EVENT, handleInvalidate);
  window.addEventListener(GUEST_SESSION_CHANGE_EVENT, handleInvalidate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WORKSPACE_PROFILE_CHANGE_EVENT, handleInvalidate);
    window.removeEventListener(GUEST_SESSION_CHANGE_EVENT, handleInvalidate);
  };
}

export function useWorkspaceProfile(): WorkspaceProfile {
  return useSyncExternalStore(
    subscribe,
    getStoredWorkspaceProfile,
    createDefaultWorkspaceProfile,
  );
}
