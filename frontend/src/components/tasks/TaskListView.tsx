"use client";

import type { Task, TaskStatus } from "./types";
import { TaskSection } from "./TaskSection";
import { taskListSections } from "./task-sections";

interface TaskListViewProps {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  hideEmptySections?: boolean;
}

export function TaskListView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  hideEmptySections = false,
}: TaskListViewProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
        <div className="flex w-full min-w-[760px] flex-col gap-3">
          {taskListSections.map((section) => {
            const sectionTasks = tasks.filter((task) => task.status === section.key);

            if (hideEmptySections && sectionTasks.length === 0) {
              return null;
            }

            return (
              <TaskSection
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
    </div>
  );
}
