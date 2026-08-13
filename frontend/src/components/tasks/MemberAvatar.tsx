"use client";

import { Plus } from "lucide-react";
import type { TaskMember } from "./types";

interface MemberAvatarProps {
  member: TaskMember;
  showName?: boolean;
}

export function MemberAvatar({ member, showName = false }: MemberAvatarProps) {
  if (member.kind === "person") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground ring-1 ring-border">
          {member.initials}
        </div>
        {showName ? (
          <span className="text-[12px] font-medium text-foreground">{member.name}</span>
        ) : null}
      </div>
    );
  }

  if (member.kind === "initials") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground ring-1 ring-border">
        {member.initials}
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted">
      <Plus className="h-3 w-3" aria-hidden="true" />
    </div>
  );
}
