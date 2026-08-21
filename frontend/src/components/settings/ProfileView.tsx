"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { ArrowLeft, Pencil, Upload, Users } from "lucide-react";
import {
  clearStoredGuestSession,
} from "@/components/auth/guest-session";
import {
  setStoredWorkspaceProfile,
  type WorkspaceProfile,
  type WorkspaceProfileFormValues,
  useWorkspaceProfile,
} from "@/components/auth/workspace-profile";
import { Avatar } from "@/components/layout/Avatar";

type ProfileFormState = WorkspaceProfileFormValues;

function createFormState(profile: WorkspaceProfile): ProfileFormState {
  return {
    fullName: profile.fullName,
    title: profile.title,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  };
}

function areFormValuesEqual(left: ProfileFormState, right: ProfileFormState): boolean {
  return (
    left.fullName.trim() === right.fullName.trim() &&
    left.title.trim() === right.title.trim() &&
    left.username.trim() === right.username.trim() &&
    left.avatarUrl === right.avatarUrl
  );
}

function SectionLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium leading-4 text-foreground">{title}</p>
      {description ? (
        <p className="mt-0.5 text-[11px] leading-4 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

function ProfileFieldRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5">
      <SectionLabel title={title} description={description} />
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}

function ProfileValue({
  value,
  width = "w-full sm:w-[156px]",
}: {
  value: string;
  width?: string;
}) {
  return (
    <div
      className={[
        "flex h-8 items-center rounded-[6px] border border-transparent bg-surface px-3 text-[12px] leading-4 text-foreground",
        width,
      ].join(" ")}
    >
      {value}
    </div>
  );
}

function InputPill({
  value,
  onChange,
  placeholder,
  width = "w-full sm:w-[156px]",
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  width?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[
        "h-8 rounded-[6px] border border-border bg-background px-3 text-[12px] leading-4 text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground",
        width,
      ].join(" ")}
    />
  );
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load selected image."));
    image.src = source;
  });
}

async function resizeImageToSquareDataUrl(file: File): Promise<string> {
  const source = URL.createObjectURL(file);

  try {
    const image = await loadImage(source);
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context is unavailable.");
    }

    const cropSize = Math.min(image.width, image.height);
    const cropX = (image.width - cropSize) / 2;
    const cropY = (image.height - cropSize) / 2;

    context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function ProfileView() {
  const router = useRouter();
  const profile = useWorkspaceProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState<ProfileFormState>(() =>
    createFormState(profile),
  );
  const [isEditing, setIsEditing] = useState(false);

  const currentForm = createFormState(profile);
  const hasChanges = !areFormValuesEqual(formValues, currentForm);

  const handleChange =
    (field: keyof ProfileFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setFormValues((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    try {
      const avatarUrl = await resizeImageToSquareDataUrl(file);
      setFormValues((current) => ({
        ...current,
        avatarUrl,
      }));
    } catch {
      // Ignore invalid images and keep the previous avatar.
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = () => {
    const nextProfile = setStoredWorkspaceProfile(formValues, profile);
    setFormValues(createFormState(nextProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormValues(createFormState(profile));
    setIsEditing(false);
  };

  const handleLeaveWorkspace = () => {
    if (profile.authType === "google") {
      clearStoredGuestSession();
      void signOut({ callbackUrl: "/login" });
      return;
    }

    clearStoredGuestSession();
    router.replace("/login");
  };

  const avatarSource = isEditing ? formValues.avatarUrl ?? profile.avatarUrl : profile.avatarUrl;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to app
        </Link>
        <span className="text-[12px] font-medium text-muted">Profile</span>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex w-full max-w-[640px] flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-medium leading-6 tracking-[-0.03em] text-foreground sm:text-[22px]">
                Profile
              </h1>
            </div>

            {isEditing ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex h-9 items-center rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface sm:h-8"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="inline-flex h-9 items-center rounded-[4px] bg-foreground px-3 text-[12px] font-medium text-background transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8"
                >
                  Save changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFormValues(createFormState(profile));
                  setIsEditing(true);
                }}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface sm:h-8"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit profile
              </button>
            )}
          </div>

          <section className="mt-5 overflow-hidden rounded-[10px] border border-border bg-background sm:mt-6">
            <ProfileFieldRow title="Profile picture">
              <div className="flex items-center gap-3">
                <Avatar
                  alt={profile.fullName}
                  initials={profile.initials}
                  src={avatarSource}
                  sizeClassName="h-10 w-10"
                  textClassName="text-[12px]"
                />

                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      Upload photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        void handleAvatarChange(event);
                      }}
                    />
                  </>
                ) : null}
              </div>
            </ProfileFieldRow>

            <div className="border-t border-border px-4 py-3.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <SectionLabel title="Email" />
                <span className="text-[12px] leading-4 text-foreground">{profile.email}</span>
              </div>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow title="Full name">
                {isEditing ? (
                  <InputPill
                    value={formValues.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Dexter"
                  />
                ) : (
                  <ProfileValue value={profile.fullName} />
                )}
              </ProfileFieldRow>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow
                title="Title"
                description="Your job title or role"
              >
                {isEditing ? (
                  <InputPill
                    value={formValues.title}
                    onChange={handleChange("title")}
                    placeholder="Designer"
                  />
                ) : (
                  <ProfileValue value={profile.title} />
                )}
              </ProfileFieldRow>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow
                title="Username"
                description="One word, like a nickname or first name"
              >
                {isEditing ? (
                  <InputPill
                    value={formValues.username}
                    onChange={handleChange("username")}
                    placeholder="Dexuser"
                  />
                ) : (
                  <ProfileValue value={profile.username} />
                )}
              </ProfileFieldRow>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-medium leading-5 text-foreground">
              Workspace access
            </h2>

            <div className="mt-3 overflow-hidden rounded-[10px] border border-border bg-background">
              <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="flex items-center gap-2 text-muted">
                  <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <p className="text-[12px] leading-4">
                    Remove yourself from the workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLeaveWorkspace}
                  className="inline-flex h-8 shrink-0 items-center rounded-[4px] bg-[#fee2e2] px-3 text-[12px] font-medium text-[#ef4444] transition-colors hover:bg-[#fecaca]"
                >
                  Leave Workspace
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
