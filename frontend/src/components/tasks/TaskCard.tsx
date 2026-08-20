"use client";

import { type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { PriorityIndicator } from "./PriorityIndicator";
import { MemberAvatar } from "./MemberAvatar";
import { formatTaskDate } from "./task-date";
import { TaskActionsMenu } from "./TaskActionsMenu";

interface TaskCardProps {
  task: Task;
  statusLabel: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
}

export function TaskCard({
  task,
  statusLabel,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
}: TaskCardProps) {
  const dueDate = formatTaskDate(task.dueDate);
  const router = useRouter();
  const detailHref = `/tasks/${task.id}`;

  const handleOpenDetail = () => {
    router.push(detailHref);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleOpenDetail();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={handleKeyDown}
      className="cursor-pointer rounded-[8px] border border-border bg-background px-3 py-2.5 outline-none transition-colors hover:border-foreground/20 hover:bg-surface/40 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </h3>

        <div onClick={(event) => event.stopPropagation()}>
          <TaskActionsMenu
            taskTitle={task.title}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
          />
        </div>
      </div>

      {fieldVisibility.priority || fieldVisibility.status ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {fieldVisibility.priority ? (
            <PriorityIndicator priority={task.priority} />
          ) : null}
          {fieldVisibility.status ? (
            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
              {statusLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {fieldVisibility.members || fieldVisibility.dueDate ? (
        <div
          className={[
            "mt-2.5 flex items-center gap-3",
            fieldVisibility.members && fieldVisibility.dueDate
              ? "justify-between"
              : "justify-start",
          ].join(" ")}
        >
          {fieldVisibility.members ? (
            <MemberAvatar
              assigneeName={task.assigneeName}
              assigneeInitials={task.assigneeInitials}
              showName
            />
          ) : null}

          {fieldVisibility.dueDate ? (
            <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
              {dueDate ?? "-"}
            </span>
          ) : null}
        </div>
      ) : null}

      {fieldVisibility.labels && task.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
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
