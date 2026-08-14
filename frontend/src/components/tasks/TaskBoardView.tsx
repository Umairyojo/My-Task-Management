"use client";

import type { Task, TaskStatus } from "./types";
import { TaskBoardColumn } from "./TaskBoardColumn";
import { taskBoardSections } from "./task-sections";

interface TaskBoardViewProps {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TaskBoardView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskBoardViewProps) {
  return (
    <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
      <div className="flex w-max min-w-full gap-3">
        {taskBoardSections.map((section) => {
          const sectionTasks = tasks.filter((task) => task.status === section.key);

          return (
            <TaskBoardColumn
              key={section.key}
              status={section.key}
              title={section.title}
              tasks={sectionTasks}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </div>
    </div>
  );
}
