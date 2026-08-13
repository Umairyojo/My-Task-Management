import type { TaskPriority } from "./types";

const priorityStyles: Record<
  TaskPriority,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  high: {
    label: "High",
    badgeClassName: "bg-red-50 text-red-600 ring-red-100",
    dotClassName: "bg-red-500",
  },
  medium: {
    label: "Medium",
    badgeClassName: "bg-orange-50 text-orange-600 ring-orange-100",
    dotClassName: "bg-orange-500",
  },
  low: {
    label: "Low",
    badgeClassName: "bg-zinc-100 text-zinc-500 ring-zinc-200",
    dotClassName: "bg-zinc-400",
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
