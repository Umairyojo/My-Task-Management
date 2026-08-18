"use client";

import type { TaskPriority } from "./types";

const priorityStyles: Record<
  TaskPriority,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
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
};

interface PriorityIndicatorProps {
  priority: TaskPriority;
}

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const { label, badgeClassName, dotClassName } = priorityStyles[priority];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        badgeClassName,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
