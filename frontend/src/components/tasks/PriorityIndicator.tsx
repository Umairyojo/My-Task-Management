"use client";

import type { TaskPriority } from "./types";

const priorityStyles: Record<
  TaskPriority,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  urgent: {
    label: "Urgent",
    badgeClassName: "bg-red-600/10 text-red-700 ring-red-600/15",
    dotClassName: "bg-red-600",
  },
  high: {
    label: "High",
    badgeClassName: "bg-red-500/10 text-red-600 ring-red-500/15",
    dotClassName: "bg-red-500",
  },
  medium: {
    label: "Medium",
    badgeClassName: "bg-orange-500/10 text-orange-600 ring-orange-500/15",
    dotClassName: "bg-orange-500",
  },
  low: {
    label: "Low",
    badgeClassName: "bg-zinc-500/10 text-zinc-500 ring-zinc-500/15",
    dotClassName: "bg-zinc-400 dark:bg-zinc-300",
  },
  "no-priority": {
    label: "No Priority",
    badgeClassName: "bg-zinc-500/10 text-zinc-500 ring-zinc-500/15",
    dotClassName: "bg-zinc-300 dark:bg-zinc-500",
  },
};

interface PriorityIndicatorProps {
  priority: TaskPriority;
  variant?: "badge" | "inline";
}

export function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const iconToneClassName = {
    urgent: "text-red-600",
    high: "text-red-500",
    medium: "text-orange-500",
    low: "text-zinc-400 dark:text-zinc-300",
    "no-priority": "text-muted",
  }[priority];

  if (priority === "no-priority") {
    return <span aria-hidden="true" className={`h-2 w-2 rounded-full border border-current ${iconToneClassName}`} />;
  }

  return (
    <span aria-hidden="true" className={`inline-flex h-3.5 w-3.5 items-end gap-[1px] ${iconToneClassName}`}>
      <span className="h-1 w-[2px] rounded-full bg-current" />
      <span className="h-2 w-[2px] rounded-full bg-current" />
      <span className="h-3.5 w-[2px] rounded-full bg-current" />
    </span>
  );
}

export function PriorityIndicator({ priority, variant = "badge" }: PriorityIndicatorProps) {
  const { label, badgeClassName, dotClassName } = priorityStyles[priority];

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium ${priority === "urgent" ? "text-red-600" : priority === "high" ? "text-red-500" : priority === "medium" ? "text-orange-500" : "text-muted"}`}>
        <PriorityIcon priority={priority} />
        {label}
      </span>
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
        badgeClassName,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
