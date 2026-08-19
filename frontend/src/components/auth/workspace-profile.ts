import { useSyncExternalStore } from "react";
import {
  getDefaultGuestSession,
  getStoredGuestSession,
  GUEST_SESSION_STORAGE_KEY,
  setStoredGuestSession,
  GUEST_SESSION_CHANGE_EVENT,
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

export const WORKSPACE_PROFILE_STORAGE_KEY =
  "task-management-workspace-profile";
export const WORKSPACE_PROFILE_CHANGE_EVENT =
  "task-management-workspace-profile-change";

const DEFAULT_WORKSPACE_EMAIL = "dexter@gmail.com";

const DEFAULT_WORKSPACE_PROFILE: WorkspaceProfile = {
  fullName: "Dexter",
  title: "Designer",
  username: "Dexuser",
  email: DEFAULT_WORKSPACE_EMAIL,
  initials: "D",
};

let cachedWorkspaceProfileRaw: string | null | undefined = undefined;
let cachedWorkspaceProfileSnapshot: WorkspaceProfile =
  DEFAULT_WORKSPACE_PROFILE;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getInitials(value: string): string {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "G";
  }

  return parts
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isLegacyWorkspaceProfile(profile: WorkspaceProfile): boolean {
  return (
    profile.fullName === "Guest" &&
    profile.title === "Guest" &&
    profile.username === "guest" &&
    profile.email === "guest@ablespace.local" &&
    profile.initials === "G"
  );
}

function normalizeStoredEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (
    trimmedEmail.length === 0 ||
    trimmedEmail === "guest@ablespace.local"
  ) {
    return DEFAULT_WORKSPACE_EMAIL;
  }

  return trimmedEmail;
}

export function createDefaultWorkspaceProfile(): WorkspaceProfile {
  const guestSession =
    typeof window === "undefined" ? null : getStoredGuestSession();
  const fallbackGuest = guestSession ?? getDefaultGuestSession();

  return {
    fullName: fallbackGuest.name,
    title: DEFAULT_WORKSPACE_PROFILE.title,
    username: DEFAULT_WORKSPACE_PROFILE.username,
    email: DEFAULT_WORKSPACE_EMAIL,
    initials: fallbackGuest.initials,
  };
}

export function toWorkspaceProfile(
  values: WorkspaceProfileFormValues,
  currentEmail: string = DEFAULT_WORKSPACE_EMAIL,
): WorkspaceProfile {
  const fullName = values.fullName.trim() || getDefaultGuestSession().name;
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

  const rawValue = window.localStorage.getItem(WORKSPACE_PROFILE_STORAGE_KEY);

  if (rawValue === cachedWorkspaceProfileRaw) {
    return cachedWorkspaceProfileSnapshot;
  }

  if (!rawValue) {
    const nextProfile = createDefaultWorkspaceProfile();
    cachedWorkspaceProfileRaw = null;
    cachedWorkspaceProfileSnapshot = nextProfile;
    return nextProfile;
  }

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
      const nextProfile = {
        fullName: parsed.fullName.trim(),
        title: parsed.title.trim() || "Guest",
        username: parsed.username.trim(),
        email: normalizeStoredEmail(parsed.email),
        initials: parsed.initials.trim(),
      };

      if (isLegacyWorkspaceProfile(nextProfile)) {
        cachedWorkspaceProfileRaw = rawValue;
        cachedWorkspaceProfileSnapshot = DEFAULT_WORKSPACE_PROFILE;
        return DEFAULT_WORKSPACE_PROFILE;
      }

      cachedWorkspaceProfileRaw = rawValue;
      cachedWorkspaceProfileSnapshot = nextProfile;

      return nextProfile;
    }
  } catch {
    const nextProfile = createDefaultWorkspaceProfile();
    cachedWorkspaceProfileRaw = null;
    cachedWorkspaceProfileSnapshot = nextProfile;
    return nextProfile;
  }

  const nextProfile = createDefaultWorkspaceProfile();
  cachedWorkspaceProfileRaw = null;
  cachedWorkspaceProfileSnapshot = nextProfile;
  return nextProfile;
}

export function setStoredWorkspaceProfile(
  values: WorkspaceProfileFormValues,
): WorkspaceProfile {
  const currentProfile = getStoredWorkspaceProfile();
  const nextProfile = toWorkspaceProfile(values, currentProfile.email);

  window.localStorage.setItem(
    WORKSPACE_PROFILE_STORAGE_KEY,
    JSON.stringify(nextProfile),
  );
  setStoredGuestSession({
    name: nextProfile.fullName,
    initials: nextProfile.initials,
  });
  window.dispatchEvent(new Event(WORKSPACE_PROFILE_CHANGE_EVENT));

  return nextProfile;
}

function subscribe(callback: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === WORKSPACE_PROFILE_STORAGE_KEY ||
      event.key === GUEST_SESSION_STORAGE_KEY ||
      event.key === null
    ) {
      cachedWorkspaceProfileRaw = undefined;
      callback();
    }
  };

  const handleChange = () => {
    cachedWorkspaceProfileRaw = undefined;
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WORKSPACE_PROFILE_CHANGE_EVENT, handleChange);
  window.addEventListener(GUEST_SESSION_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WORKSPACE_PROFILE_CHANGE_EVENT, handleChange);
    window.removeEventListener(GUEST_SESSION_CHANGE_EVENT, handleChange);
  };
}

export function useWorkspaceProfile(): WorkspaceProfile {
  return useSyncExternalStore(
    subscribe,
    getStoredWorkspaceProfile,
    createDefaultWorkspaceProfile,
  );
}
