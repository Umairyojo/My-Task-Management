"use client";

import { useState } from "react";
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
  showAddTask?: boolean;
  showActions?: boolean;
}

export function TaskSection({
  status,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  fieldVisibility,
  showAddTask = true,
  showActions = true,
}: TaskSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="space-y-1">
      <button
        type="button"
        onClick={() => setIsCollapsed((current) => !current)}
        aria-expanded={!isCollapsed}
        className="flex h-6 items-center gap-1.5 rounded-md px-1 text-left text-[11px] font-medium text-foreground transition-colors hover:bg-surface"
      >
        <ChevronDown
          className={[
            "h-3.5 w-3.5 text-muted transition-transform",
            isCollapsed ? "-rotate-90" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        />
        <h2>{title}</h2>
      </button>
      {isCollapsed ? null : (
        <TaskTable
          status={status}
          sectionTitle={title}
          tasks={tasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          fieldVisibility={fieldVisibility}
          showAddTask={showAddTask}
          showActions={showActions}
        />
      )}
    </section>
  );
}
