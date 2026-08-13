"use client";

import type { Task } from "./types";
import { TaskSection } from "./TaskSection";
import { taskListSections } from "./task-sections";

interface TaskListViewProps {
  tasks: Task[];
}

export function TaskListView({ tasks }: TaskListViewProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
        <div className="flex w-full min-w-[760px] flex-col gap-3">
          {taskListSections.map((section) => (
            <TaskSection
              key={section.key}
              title={section.title}
              tasks={tasks.filter((task) => task.status === section.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
