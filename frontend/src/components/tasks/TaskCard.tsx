"use client";

import { MoreHorizontal } from "lucide-react";
import type { Task } from "./types";
import { MemberAvatar } from "./MemberAvatar";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </h3>

        <button
          type="button"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">{task.title} actions</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <MemberAvatar member={task.member} showName />

        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
          {task.dueDate}
        </span>
      </div>

      {task.labels && task.labels.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span
              key={`${task.id}-${label}`}
              className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium leading-4 text-muted"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
