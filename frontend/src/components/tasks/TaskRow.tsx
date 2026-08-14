"use client";

import type { Task } from "./types";
import { MemberAvatar } from "./MemberAvatar";
import { PriorityIndicator } from "./PriorityIndicator";
import { formatTaskDate } from "./task-date";
import { TaskActionsMenu } from "./TaskActionsMenu";

interface TaskRowProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TaskRow({
  task,
  onEditTask,
  onDeleteTask,
}: TaskRowProps) {
  const dueDate = formatTaskDate(task.dueDate);

  return (
    <tr className="border-t border-border first:border-t-0 hover:bg-surface/40">
      <td className="px-4 py-2.5 align-middle">
        <span className="block truncate text-[12px] font-medium leading-4 text-foreground">
          {task.title}
        </span>
      </td>
      <td className="px-4 py-2.5 align-middle">
        <PriorityIndicator priority={task.priority} />
      </td>
      <td className="px-4 py-2.5 align-middle">
        <MemberAvatar
          assigneeName={task.assigneeName}
          assigneeInitials={task.assigneeInitials}
        />
      </td>
      <td className="px-4 py-2.5 align-middle">
        <span className="text-[12px] leading-4 text-muted">
          {dueDate ?? "-"}
        </span>
      </td>
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
