"use client";

import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearStoredGuestSession } from "@/components/auth/guest-session";
import {
  setStoredWorkspaceProfile,
  type WorkspaceProfileFormValues,
  useWorkspaceProfile,
} from "@/components/auth/workspace-profile";

type ProfileFormState = WorkspaceProfileFormValues;

function createFormState(profile: {
  fullName: string;
  title: string;
  username: string;
}): ProfileFormState {
  return {
    fullName: profile.fullName,
    title: profile.title,
    username: profile.username,
  };
}

function areFormValuesEqual(
  left: ProfileFormState,
  right: ProfileFormState,
): boolean {
  return (
    left.fullName.trim() === right.fullName.trim() &&
    left.title.trim() === right.title.trim() &&
    left.username.trim() === right.username.trim()
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

function ProfilePictureBadge({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-[radial-gradient(circle_at_25%_20%,#f9a8d4_0%,#c084fc_44%,#60a5fa_100%)] text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      {initials}
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const profile = useWorkspaceProfile();
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

  const handleSave = () => {
    const nextProfile = setStoredWorkspaceProfile(formValues);
    setFormValues(createFormState(nextProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormValues(createFormState(profile));
    setIsEditing(false);
  };

  const handleLeaveWorkspace = () => {
    clearStoredGuestSession();
    router.replace("/login");
  };

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
              <h1 className="text-[17px] font-medium leading-6 tracking-[-0.03em] text-foreground sm:text-[18px]">
                Profile
              </h1>
              <p className="mt-1 text-[12px] leading-4 text-muted">
                Update the active guest profile used in the sidebar and settings.
              </p>
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
              <ProfilePictureBadge initials={profile.initials} />
            </ProfileFieldRow>

            <div className="border-t border-border px-4 py-3.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <SectionLabel title="Email" />

                <div className="flex items-center gap-2">
                  <span className="text-[12px] leading-4 text-foreground">
                    {profile.email}
                  </span>
                </div>
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
            <h2 className="text-[14px] font-medium leading-5 text-foreground">
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
