"use client";

import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { TaskRow } from "./TaskRow";

interface TaskTableProps {
  status: TaskStatus;
  sectionTitle: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
  showAddTask?: boolean;
  showActions?: boolean;
}

export function TaskTable({
  status,
  sectionTitle,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
  showAddTask = true,
  showActions = true,
}: TaskTableProps) {
  const visibleColumnCount =
    1 +
    (fieldVisibility.priority ? 1 : 0) +
    (fieldVisibility.members ? 1 : 0) +
    (fieldVisibility.dueDate ? 1 : 0) +
    (fieldVisibility.labels ? 1 : 0) +
    (fieldVisibility.status ? 1 : 0) +
    (showActions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-[8px] border border-border bg-background">
      <table className="min-w-full border-collapse">
        <thead className="bg-surface">
          <tr className="text-left text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            <th className="w-[46%] px-4 py-2 font-medium normal-case tracking-normal">Task</th>
            {fieldVisibility.priority ? (
              <th className="w-[12%] px-4 py-2 font-medium normal-case tracking-normal">Priority</th>
            ) : null}
            {fieldVisibility.members ? (
              <th className="w-[16%] px-4 py-2 font-medium normal-case tracking-normal">Members</th>
            ) : null}
            {fieldVisibility.dueDate ? (
              <th className="w-[12%] px-4 py-2 font-medium normal-case tracking-normal">Due Date</th>
            ) : null}
            {fieldVisibility.labels ? (
              <th className="w-[14%] px-4 py-2 font-medium normal-case tracking-normal">Labels</th>
            ) : null}
            {fieldVisibility.status ? (
              <th className="w-[10%] px-4 py-2 font-medium normal-case tracking-normal">Status</th>
            ) : null}
            {showActions ? (
              <th className="w-[6%] px-4 py-2 font-medium normal-case tracking-normal text-right">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              sectionTitle={sectionTitle}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              fieldVisibility={fieldVisibility}
              showActions={showActions}
            />
          ))}
        </tbody>
        {showAddTask ? (
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={visibleColumnCount} className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => onAddTask(status)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Task
                </button>
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
