"use client";

import Link from "next/link";
import type { Task } from "./types";
import { MemberAvatar } from "./MemberAvatar";
import { PriorityIndicator } from "./PriorityIndicator";
import { formatTaskDate } from "./task-date";
import { TaskActionsMenu } from "./TaskActionsMenu";
import type { TaskFieldVisibility } from "./task-fields";

interface TaskRowProps {
  task: Task;
  sectionTitle: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
  showActions?: boolean;
}

export function TaskRow({
  task,
  sectionTitle,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
  showActions = true,
}: TaskRowProps) {
  const dueDate = formatTaskDate(task.dueDate);

  return (
    <tr className="border-t border-border first:border-t-0 hover:bg-surface/40">
      <td className="px-4 py-2 align-middle">
        <Link
          href={`/tasks/${task.id}`}
          className="block truncate text-[12px] font-medium leading-4 text-foreground transition-colors hover:text-muted"
        >
          {task.title}
        </Link>
      </td>
      {fieldVisibility.priority ? (
        <td className="px-4 py-2 align-middle">
          <PriorityIndicator priority={task.priority} variant="inline" />
        </td>
      ) : null}
      {fieldVisibility.members ? (
        <td className="px-4 py-2 align-middle">
          <MemberAvatar
            assigneeName={task.assigneeName}
            assigneeInitials={task.assigneeInitials}
          />
        </td>
      ) : null}
      {fieldVisibility.dueDate ? (
        <td className="px-4 py-2 align-middle whitespace-nowrap">
          <span className="text-[12px] leading-4 text-muted">
            {dueDate ?? "-"}
          </span>
        </td>
      ) : null}
      {fieldVisibility.labels ? (
        <td className="px-4 py-2 align-middle">
          {task.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={`${task.id}-${label}`}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium leading-4 text-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[12px] leading-4 text-muted">-</span>
          )}
        </td>
      ) : null}
      {fieldVisibility.status ? (
        <td className="px-4 py-2 align-middle whitespace-nowrap">
          <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
            {sectionTitle}
          </span>
        </td>
      ) : null}
      {showActions ? (
        <td className="px-4 py-2 align-middle text-right">
          <div className="flex justify-end">
            <TaskActionsMenu
              taskTitle={task.title}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          </div>
        </td>
      ) : null}
    </tr>
  );
}
