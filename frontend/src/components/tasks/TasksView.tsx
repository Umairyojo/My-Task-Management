"use client";

import { useState } from "react";
import { mockTasks } from "./mock-tasks";
import type { TaskViewMode } from "./types";
import { TaskBoardView } from "./TaskBoardView";
import { TaskListView } from "./TaskListView";
import { TaskToolbar } from "./TaskToolbar";

export function TasksView() {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5">
      <TaskToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === "list" ? (
        <TaskListView tasks={mockTasks} />
      ) : (
        <TaskBoardView tasks={mockTasks} />
      )}
    </div>
  );
}
