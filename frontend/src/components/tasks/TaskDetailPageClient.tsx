"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { TaskApiError, getTask } from "@/services/tasks-api";
import type { TaskDetail } from "./types";
import { TaskDetailExperience } from "./TaskDetailExperience";

export function TaskDetailPageClient({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<"not-found" | "request" | null>(null);
  const requestId = useRef(0);

  const loadTask = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setError(null);

    try {
      const detail = await getTask(taskId);
      if (currentRequest === requestId.current) {
        setTask(detail);
      }
    } catch (reason) {
      if (currentRequest !== requestId.current) {
        return;
      }

      setTask(null);
      setError(reason instanceof TaskApiError && reason.status === 404 ? "not-found" : "request");
    }
  }, [taskId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTask();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadTask]);

  if (!task && !error) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoaderCircle className="h-5 w-5 animate-spin text-muted" aria-label="Loading task" />
      </div>
    );
  }

  if (error) {
    const notFound = error === "not-found";
    return (
      <div className="mx-auto flex min-h-[320px] w-full max-w-md flex-col items-start justify-center gap-3">
        <p className="text-[18px] font-semibold text-foreground">
          {notFound ? "Task not found" : "Unable to load task"}
        </p>
        <p className="text-[13px] leading-5 text-muted">
          {notFound
            ? "This task may have been removed or the link is invalid."
            : "Check that the backend is running, then try again."}
        </p>
        <div className="mt-1 flex gap-2">
          {!notFound ? (
            <button
              type="button"
              onClick={() => void loadTask()}
              className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] font-medium text-foreground hover:bg-surface"
            >
              Retry
            </button>
          ) : null}
          <Link
            href="/tasks"
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-border bg-background px-3 text-[13px] font-medium text-foreground hover:bg-surface"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return task ? <TaskDetailExperience initialTask={task} /> : null;
}
