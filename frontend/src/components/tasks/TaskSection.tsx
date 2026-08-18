"use client";

import { ChevronDown } from "lucide-react";
import type { Task, TaskStatus } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { TaskTable } from "./TaskTable";

interface TaskSectionProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  fieldVisibility: TaskFieldVisibility;
}

export function TaskSection({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
}: TaskSectionProps) {
  return (
    <section className="space-y-1.5">
      <div className="flex h-7 items-center gap-1.5 rounded-md px-1 text-[12px] font-medium text-foreground">
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      <TaskTable
        status={status}
        sectionTitle={title}
        tasks={tasks}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        fieldVisibility={fieldVisibility}
      />
    </section>
  );
}
