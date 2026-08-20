"use client";

import type { Task, TaskStatus } from "./types";
import type { TaskFieldVisibility } from "./task-fields";
import { TaskSection } from "./TaskSection";
import { taskListSections } from "./task-sections";

interface TaskListViewProps {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  hideEmptySections?: boolean;
  fieldVisibility: TaskFieldVisibility;
  showAddTask?: boolean;
  showActions?: boolean;
}

export function TaskListView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  hideEmptySections = false,
  fieldVisibility,
  showAddTask = true,
  showActions = true,
}: TaskListViewProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
        <div className="flex w-full min-w-[760px] flex-col gap-2.5">
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
                fieldVisibility={fieldVisibility}
                showAddTask={showAddTask}
                showActions={showActions}
            />
          );
        })}
        </div>
      </div>
    </div>
  );
}
