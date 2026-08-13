"use client";

import { taskBoardSections } from "./mock-tasks";
import type { Task } from "./types";
import { TaskBoardColumn } from "./TaskBoardColumn";

interface TaskBoardViewProps {
  tasks: Task[];
}

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  return (
    <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
      <div className="flex w-max min-w-full gap-3">
        {taskBoardSections.map((section) => {
          const sectionTasks = tasks.filter((task) => task.status === section.key);

          return (
            <TaskBoardColumn
              key={section.key}
              title={section.title}
              tasks={sectionTasks}
            />
          );
        })}
      </div>
    </div>
  );
}
