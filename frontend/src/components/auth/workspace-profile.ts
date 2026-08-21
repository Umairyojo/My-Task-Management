"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_GUEST_IDENTITY,
  GUEST_SESSION_CHANGE_EVENT,
  setStoredGuestSession,
} from "./guest-session";
import { useCurrentUserIdentity, type CurrentUserIdentity } from "./current-user";

export interface WorkspaceProfile {
  authType: "guest" | "google";
  profileKey: string;
  fullName: string;
  title: string;
  username: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
}

export interface WorkspaceProfileFormValues {
  fullName: string;
  title: string;
  username: string;
  avatarUrl: string | null;
}

const DEFAULT_WORKSPACE_EMAIL = "guest@ablespace.local";
const DEFAULT_GUEST_AVATAR_SRC = "/guest-avatar.svg";
const DEFAULT_WORKSPACE_PROFILE_BASE = {
  title: "Designer",
  username: "Dexuser",
};

const WORKSPACE_PROFILE_STORAGE_KEY_PREFIX = "task-management-workspace-profile";
const LEGACY_WORKSPACE_PROFILE_STORAGE_KEY =
  "task-management-workspace-profile";
export const WORKSPACE_PROFILE_CHANGE_EVENT =
  "task-management-workspace-profile-change";

let cachedWorkspaceProfileKey: string | null | undefined = undefined;
let cachedWorkspaceProfileRaw: string | null | undefined = undefined;
let cachedWorkspaceProfileSnapshot: WorkspaceProfile | null = null;

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

function normalizeStoredEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return DEFAULT_WORKSPACE_EMAIL;
  }

  return trimmedEmail;
}

function getWorkspaceProfileStorageKey(profileKey: string): string {
  return `${WORKSPACE_PROFILE_STORAGE_KEY_PREFIX}:${profileKey}`;
}

function createDefaultProfile(currentUser: CurrentUserIdentity | null): WorkspaceProfile {
  if (!currentUser) {
    return {
      authType: "guest",
      profileKey: "guest:anonymous",
      fullName: DEFAULT_GUEST_IDENTITY.name,
      title: DEFAULT_WORKSPACE_PROFILE_BASE.title,
      username: DEFAULT_WORKSPACE_PROFILE_BASE.username,
      email: DEFAULT_WORKSPACE_EMAIL,
      initials: DEFAULT_GUEST_IDENTITY.initials,
      avatarUrl: DEFAULT_GUEST_AVATAR_SRC,
    };
  }

  return {
    authType: currentUser.authType,
    profileKey: currentUser.id,
    fullName: currentUser.name,
    title: DEFAULT_WORKSPACE_PROFILE_BASE.title,
    username: DEFAULT_WORKSPACE_PROFILE_BASE.username,
    email: normalizeStoredEmail(currentUser.email),
    initials: currentUser.initials,
    avatarUrl: currentUser.image ?? DEFAULT_GUEST_AVATAR_SRC,
  };
}

function parseWorkspaceProfile(rawValue: string): WorkspaceProfile | null {
  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      isRecord(parsed) &&
      (parsed.authType === "guest" || parsed.authType === "google") &&
      typeof parsed.profileKey === "string" &&
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
        authType: parsed.authType,
        profileKey: parsed.profileKey.trim(),
        fullName: parsed.fullName.trim(),
        title: parsed.title.trim() || DEFAULT_WORKSPACE_PROFILE_BASE.title,
        username: parsed.username.trim(),
        email: normalizeStoredEmail(parsed.email),
        initials: parsed.initials.trim().toUpperCase().slice(0, 2),
        avatarUrl:
          typeof parsed.avatarUrl === "string" && parsed.avatarUrl.trim().length > 0
            ? parsed.avatarUrl
            : null,
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

export function createDefaultWorkspaceProfile(
  currentUser: CurrentUserIdentity | null = null,
): WorkspaceProfile {
  return createDefaultProfile(currentUser);
}

export function toWorkspaceProfile(
  values: WorkspaceProfileFormValues,
  currentProfile: WorkspaceProfile,
): WorkspaceProfile {
  const fullName = values.fullName.trim() || DEFAULT_GUEST_IDENTITY.name;
  const title = values.title.trim() || DEFAULT_WORKSPACE_PROFILE_BASE.title;
  const username = values.username.trim() || DEFAULT_WORKSPACE_PROFILE_BASE.username;

  return {
    ...currentProfile,
    fullName,
    title,
    username,
    initials: getInitials(fullName),
    avatarUrl: values.avatarUrl?.trim() || currentProfile.avatarUrl,
  };
}

export function getStoredWorkspaceProfile(
  currentUser: CurrentUserIdentity | null,
): WorkspaceProfile {
  if (typeof window === "undefined") {
    return cachedWorkspaceProfileSnapshot ?? createDefaultProfile(currentUser);
  }

  if (!currentUser) {
    cachedWorkspaceProfileKey = null;
    cachedWorkspaceProfileRaw = null;
    cachedWorkspaceProfileSnapshot = createDefaultProfile(null);
    return cachedWorkspaceProfileSnapshot;
  }

  const storageKey = getWorkspaceProfileStorageKey(currentUser.id);
  const rawValue = window.localStorage.getItem(storageKey);

  if (storageKey === cachedWorkspaceProfileKey && rawValue === cachedWorkspaceProfileRaw) {
    return cachedWorkspaceProfileSnapshot ?? createDefaultProfile(currentUser);
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

  if (currentUser.authType === "guest") {
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
  }

  const nextProfile = createDefaultProfile(currentUser);
  const nextRaw = JSON.stringify(nextProfile);
  window.localStorage.setItem(storageKey, nextRaw);
  cachedWorkspaceProfileKey = storageKey;
  cachedWorkspaceProfileRaw = nextRaw;
  cachedWorkspaceProfileSnapshot = nextProfile;
  return nextProfile;
}

export function setStoredWorkspaceProfile(
  values: WorkspaceProfileFormValues,
  currentProfile: WorkspaceProfile,
): WorkspaceProfile {
  const nextProfile = toWorkspaceProfile(values, currentProfile);
  const storageKey = getWorkspaceProfileStorageKey(nextProfile.profileKey);
  const nextRaw = JSON.stringify(nextProfile);

  window.localStorage.setItem(storageKey, nextRaw);
  cachedWorkspaceProfileKey = storageKey;
  cachedWorkspaceProfileRaw = nextRaw;
  cachedWorkspaceProfileSnapshot = nextProfile;

  if (currentProfile.authType === "guest") {
    setStoredGuestSession({
      id: currentProfile.profileKey.replace(/^guest:/, ""),
      email: nextProfile.email,
      name: nextProfile.fullName,
      initials: nextProfile.initials,
    });
  }

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
  const currentUser = useCurrentUserIdentity();

  return useSyncExternalStore(
    subscribe,
    () => getStoredWorkspaceProfile(currentUser),
    () => createDefaultWorkspaceProfile(currentUser),
  );
}
