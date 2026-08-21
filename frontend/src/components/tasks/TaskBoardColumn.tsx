"use client";

import { GripVertical, MoreHorizontal, Plus } from "lucide-react";
import type { Task, TaskStatus } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { TaskCard } from "./TaskCard";

interface TaskBoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
  draggedTaskId: string | null;
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
}

export function TaskBoardColumn({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
  draggedTaskId,
  onDragStartTask,
  onDragEndTask,
  onDropTask,
}: TaskBoardColumnProps) {
  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();

        const taskId = event.dataTransfer.getData("text/plain");

        if (taskId) {
          onDropTask(taskId, status);
        }
      }}
      className="flex w-[289px] shrink-0 flex-col rounded-[8px] border border-border bg-surface"
    >
      <header className="flex h-10 items-center justify-between gap-3 border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <GripVertical className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <h2 className="truncate text-[11px] font-medium leading-4 text-foreground">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddTask(status)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Add task to {title}</span>
          </button>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{title} actions</span>
          </button>
        </div>
      </header>

      <div className="space-y-1.5 p-2.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            statusLabel={title}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            fieldVisibility={fieldVisibility}
            draggable
            isDragging={task.id === draggedTaskId}
            onDragStart={() => onDragStartTask(task.id)}
            onDragEnd={() => onDragEndTask()}
          />
        ))}
      </div>
    </section>
  );
}
