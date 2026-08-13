"use client";

import { Plus } from "lucide-react";

interface MemberAvatarProps {
  assigneeName?: string | null;
  assigneeInitials?: string | null;
  showName?: boolean;
}

function getFallbackInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MemberAvatar({
  assigneeName,
  assigneeInitials,
  showName = false,
}: MemberAvatarProps) {
  const initials =
    assigneeInitials?.trim() || (assigneeName ? getFallbackInitials(assigneeName) : "");

  if (initials) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground ring-1 ring-border">
          {initials}
        </div>
        {showName && assigneeName ? (
          <span className="text-[12px] font-medium text-foreground">{assigneeName}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted">
      <Plus className="h-3 w-3" aria-hidden="true" />
    </div>
  );
}
