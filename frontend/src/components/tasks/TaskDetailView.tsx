"use client";

import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, CalendarDays, Edit3, Tag, User2 } from "lucide-react";
import { TaskFormDialog, type TaskFormValues } from "./TaskFormDialog";
import { MemberAvatar } from "./MemberAvatar";
import { PriorityIndicator } from "./PriorityIndicator";
import { formatTaskDate } from "./task-date";
import { taskBoardSections } from "./task-sections";
import type { Task } from "./types";
import {
  TaskApiError,
  getTask,
  updateTask,
  type TaskWriteInput,
} from "@/services/tasks-api";

function parseLabels(labels: string): string[] {
  return labels
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

function toTaskWriteInput(values: TaskFormValues): TaskWriteInput {
  return {
    title: values.title,
    status: values.status,
    priority: values.priority,
    assigneeName: values.assigneeName,
    assigneeInitials: values.assigneeInitials,
    dueDate: values.dueDate,
    labels: parseLabels(values.labels),
  };
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: Task["status"]): string {
  return taskBoardSections.find((section) => section.key === status)?.title ?? status;
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-[12px] leading-5 text-foreground">{value}</div>
    </div>
  );
}

function TaskDetailLoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-[10px] border border-border bg-background p-4">
        <div className="h-3.5 w-24 rounded-full bg-surface animate-pulse" />
        <div className="mt-3 h-8 w-72 max-w-full rounded-full bg-surface animate-pulse" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[74px] rounded-[10px] border border-border bg-surface/70 animate-pulse"
            />
          ))}
        </div>
        <div className="mt-5 h-24 rounded-[10px] border border-border bg-surface/70 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-[132px] rounded-[12px] border border-border bg-surface/70 animate-pulse" />
        <div className="h-[132px] rounded-[12px] border border-border bg-surface/70 animate-pulse" />
      </div>
    </div>
  );
}

function TaskDetailErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-background px-4 py-3.5">
      <p className="text-[12px] font-medium text-foreground">Unable to load task.</p>
      <p className="mt-1 text-[12px] leading-4 text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-8 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
      >
        Retry
      </button>
    </div>
  );
}

function TaskDetailNotFoundState() {
  return (
    <div className="rounded-[10px] border border-border bg-background px-4 py-3.5">
      <p className="text-[12px] font-medium text-foreground">Task not found.</p>
      <p className="mt-1 text-[12px] leading-4 text-muted">
        The requested task may have been deleted or the link is invalid.
      </p>
      <Link
        href="/tasks"
        className="mt-4 inline-flex h-8 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
      >
        Back to Tasks
      </Link>
    </div>
  );
}

export function TaskDetailView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "not-found">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("Unable to load task.");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const requestIdRef = useRef(0);

  const loadTask = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus("loading");

    try {
      const nextTask = await getTask(taskId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setTask(nextTask);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof TaskApiError && error.status === 404) {
        setTask(null);
        setStatus("not-found");
        return;
      }

      setTask(null);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load task.");
      setStatus("error");
    }
  }, [taskId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTask();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTask]);

  const statusLabel = useMemo(() => {
    if (!task) {
      return "";
    }

    return getStatusLabel(task.status);
  }, [task]);

  const dueDateLabel = useMemo(() => {
    if (!task) {
      return "-";
    }

    return formatTaskDate(task.dueDate) ?? "No due date";
  }, [task]);

  const handleTaskFormSubmit = useCallback(
    async (values: TaskFormValues) => {
      if (!task) {
        return;
      }

      const updatedTask = await updateTask(task.id, toTaskWriteInput(values));
      setTask(updatedTask);
    },
    [task],
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tasks
          </Link>
        </div>
        <TaskDetailLoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tasks
          </Link>
        </div>
        <TaskDetailErrorState message={errorMessage} onRetry={() => void loadTask()} />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tasks
          </Link>
        </div>
        <TaskDetailNotFoundState />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const assigneeName = task.assigneeName?.trim() || null;
  const labels = task.labels;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Tasks
        </Link>

        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface sm:h-8"
        >
          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
          Edit Task
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-[10px] border border-border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                Task Detail
              </p>
              <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                {task.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PriorityIndicator priority={task.priority} />
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-muted">
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailCard
              icon={<Tag className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Priority"
              value={<PriorityIndicator priority={task.priority} />}
            />
            <DetailCard
              icon={<Tag className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Status"
              value={statusLabel}
            />
            <DetailCard
              icon={<User2 className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Assignee"
              value={
                assigneeName ? (
                  <MemberAvatar
                    assigneeName={task.assigneeName}
                    assigneeInitials={task.assigneeInitials}
                    showName
                  />
                ) : (
                  "Unassigned"
                )
              }
            />
            <DetailCard
              icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Due Date"
              value={dueDateLabel}
            />
          </div>

          <div className="mt-4 rounded-[10px] border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Labels</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {labels.length > 0 ? (
                labels.map((label) => (
                  <span
                    key={`${task.id}-${label}`}
                    className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium leading-4 text-muted"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-[13px] leading-5 text-muted">No labels</span>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[10px] border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Activity
            </p>
            <dl className="mt-3 space-y-3 text-[12px] leading-4 text-foreground">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Created</dt>
                <dd className="text-right">{formatDateTime(task.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Updated</dt>
                <dd className="text-right">{formatDateTime(task.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[10px] border border-border bg-surface px-4 py-3 text-[12px] leading-5 text-muted">
            <p className="font-medium text-foreground">Detail view</p>
            <p className="mt-1">
              Update the task from here using the existing edit form. Title,
              status, priority, assignee, due date, and labels all stay in sync
              with the backend.
            </p>
          </section>
        </aside>
      </div>

      <TaskFormDialog
        key={isEditOpen && task ? task.id : "task-detail-edit-closed"}
        open={isEditOpen}
        mode="edit"
        defaultStatus={task.status}
        task={task}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleTaskFormSubmit}
      />
    </div>
  );
}
