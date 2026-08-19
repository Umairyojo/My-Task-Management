"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Pencil, Users } from "lucide-react";
import {
  setStoredWorkspaceProfile,
  type WorkspaceProfileFormValues,
  useWorkspaceProfile,
} from "@/components/auth/workspace-profile";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

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
    <div className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-4 py-4">
      <SectionLabel title={title} description={description} />
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}

function InputPill({
  value,
  onChange,
  placeholder,
  width = "w-[156px]",
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
        "h-8 rounded-[6px] border border-transparent bg-surface px-3 text-[12px] leading-4 text-foreground outline-none transition-colors placeholder:text-muted focus:border-border focus:bg-background",
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
  const profile = useWorkspaceProfile();
  const [formValues, setFormValues] = useState<ProfileFormState>(() =>
    createFormState(profile),
  );

  useEffect(() => {
    const currentForm = createFormState(profile);

    if (areFormValuesEqual(formValues, currentForm)) {
      return;
    }

    setStoredWorkspaceProfile(formValues);
  }, [formValues, profile]);

  const handleChange =
    (field: keyof ProfileFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setFormValues((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <ProfileSettingsSidebar />

      <div className="min-w-0 flex-1 overflow-y-auto bg-background px-6 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[640px] flex-col">
          <h1 className="text-[20px] font-medium leading-6 tracking-[-0.03em] text-foreground">
            Profile
          </h1>

          <section className="mt-7 overflow-hidden rounded-[12px] border border-border bg-background">
            <ProfileFieldRow title="Profile picture">
              <ProfilePictureBadge initials={profile.initials} />
            </ProfileFieldRow>

            <div className="border-t border-border px-4 py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
                <SectionLabel title="Email" />

                <div className="flex items-center gap-2">
                  <span className="text-[12px] leading-4 text-foreground">
                    {profile.email}
                  </span>
                  <button
                    type="button"
                    aria-label="Edit email"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow title="Full name">
                <InputPill
                  value={formValues.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Dexter"
                />
              </ProfileFieldRow>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow
                title="Title"
                description="Your job title or role"
              >
                <InputPill
                  value={formValues.title}
                  onChange={handleChange("title")}
                  placeholder="Designer"
                />
              </ProfileFieldRow>
            </div>

            <div className="border-t border-border">
              <ProfileFieldRow
                title="Username"
                description="One word, like a nickname or first name"
              >
                <InputPill
                  value={formValues.username}
                  onChange={handleChange("username")}
                  placeholder="Dexuser"
                />
              </ProfileFieldRow>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-[15px] font-medium leading-5 text-foreground">
              Workspace access
            </h2>

            <div className="mt-4 overflow-hidden rounded-[12px] border border-border bg-background">
              <div className="flex items-center justify-between gap-6 px-4 py-4">
                <div className="flex items-center gap-2 text-muted">
                  <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <p className="text-[12px] leading-4">
                    Remove yourself from the workspace
                  </p>
                </div>

                <button
                  type="button"
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
