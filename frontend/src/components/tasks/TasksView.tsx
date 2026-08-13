"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TaskViewMode } from "./types";
import { TaskBoardView } from "./TaskBoardView";
import { TaskListView } from "./TaskListView";
import { TaskToolbar } from "./TaskToolbar";
import { getTasks } from "@/services/tasks-api";
import type { Task } from "./types";
import {
  TasksEmptyState,
  TasksErrorState,
  TasksLoadingState,
} from "./TasksStates";

export function TasksView() {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const requestIdRef = useRef(0);

  const loadTasks = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus("loading");

    try {
      const nextTasks = await getTasks();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setTasks(nextTasks);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5">
      <TaskToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {status === "loading" ? (
        <TasksLoadingState viewMode={viewMode} />
      ) : status === "error" ? (
        <TasksErrorState onRetry={() => void loadTasks()} />
      ) : tasks.length === 0 ? (
        <TasksEmptyState />
      ) : viewMode === "list" ? (
        <TaskListView tasks={tasks} />
      ) : (
        <TaskBoardView tasks={tasks} />
      )}
    </div>
  );
}
