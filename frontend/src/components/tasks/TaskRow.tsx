"use client";

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
}

export function TaskRow({
  task,
  sectionTitle,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
}: TaskRowProps) {
  const dueDate = formatTaskDate(task.dueDate);

  return (
    <tr className="border-t border-border first:border-t-0 hover:bg-surface/40">
      <td className="px-4 py-2.5 align-middle">
        <span className="block truncate text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </span>
      </td>
      {fieldVisibility.priority ? (
        <td className="px-4 py-2.5 align-middle">
          <PriorityIndicator priority={task.priority} />
        </td>
      ) : null}
      {fieldVisibility.members ? (
        <td className="px-4 py-2.5 align-middle">
          <MemberAvatar
            assigneeName={task.assigneeName}
            assigneeInitials={task.assigneeInitials}
          />
        </td>
      ) : null}
      {fieldVisibility.dueDate ? (
        <td className="px-4 py-2.5 align-middle">
          <span className="text-[12px] leading-4 text-muted">
            {dueDate ?? "-"}
          </span>
        </td>
      ) : null}
      {fieldVisibility.labels ? (
        <td className="px-4 py-2.5 align-middle">
          {task.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={`${task.id}-${label}`}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium leading-4 text-muted"
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
        <td className="px-4 py-2.5 align-middle">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
            {sectionTitle}
          </span>
        </td>
      ) : null}
      <td className="px-4 py-2.5 align-middle text-right">
        <div className="flex justify-end">
          <TaskActionsMenu
            taskTitle={task.title}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
          />
        </div>
      </td>
    </tr>
  );
}
