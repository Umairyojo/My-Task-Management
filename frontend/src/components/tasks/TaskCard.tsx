"use client";

import type { Task } from "./types";
import { MemberAvatar } from "./MemberAvatar";
import { formatTaskDate } from "./task-date";
import { TaskActionsMenu } from "./TaskActionsMenu";

interface TaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TaskCard({
  task,
  onEditTask,
  onDeleteTask,
}: TaskCardProps) {
  const dueDate = formatTaskDate(task.dueDate);

  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </h3>

        <TaskActionsMenu
          taskTitle={task.title}
          onEdit={() => onEditTask(task)}
          onDelete={() => onDeleteTask(task)}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <MemberAvatar
          assigneeName={task.assigneeName}
          assigneeInitials={task.assigneeInitials}
          showName
        />

        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
          {dueDate ?? "-"}
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
