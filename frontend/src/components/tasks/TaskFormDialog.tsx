"use client";

import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { TaskPriority, TaskStatus, Task } from "./types";
import { getWorkspaceTaskStatus } from "./task-sections";

export interface TaskFormValues {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  assigneeInitials: string;
  dueDate: string;
  labels: string;
}

interface TaskFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  defaultStatus: TaskStatus;
  task?: Task;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "no-priority", label: "No Priority" },
];

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "To Do" },
  { value: "on-hold", label: "On Hold" },
  { value: "doing", label: "Doing" },
  { value: "completed", label: "Completed" },
];

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function createInitialValues(
  task: Task | undefined,
  defaultStatus: TaskStatus,
): TaskFormValues {
  return {
    title: task?.title ?? "",
    status: getWorkspaceTaskStatus(task?.status ?? defaultStatus),
    priority: task?.priority ?? "medium",
    assigneeName: task?.assigneeName ?? "",
    assigneeInitials: task?.assigneeInitials ?? "",
    dueDate: toDateInputValue(task?.dueDate),
    labels: task?.labels.join(", ") ?? "",
  };
}

function normalizeValues(values: TaskFormValues): TaskFormValues {
  return {
    title: values.title.trim(),
    status: values.status,
    priority: values.priority,
    assigneeName: values.assigneeName.trim(),
    assigneeInitials: values.assigneeInitials.trim().toUpperCase(),
    dueDate: values.dueDate.trim(),
    labels: values.labels.trim(),
  };
}

export function TaskFormDialog({
  open,
  mode,
  defaultStatus,
  task,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const [values, setValues] = useState(() =>
    createInitialValues(task, defaultStatus),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const title = mode === "create" ? "Create Task" : "Edit Task";
  const submitLabel = mode === "create" ? "Create Task" : "Save Changes";
  const description =
    mode === "create"
      ? "Fill in the task details and add it to the current list."
      : "Update the task details and save the changes to the current list.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (values.title.trim().length === 0) {
      setError("Task title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(normalizeValues(values));
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save task.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return typeof document !== "undefined"
    ? createPortal(
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 px-4 py-4 sm:items-center sm:py-6"
        onClick={onClose}
      >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-[540px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[16px] border border-border bg-background p-4 shadow-[0_18px_44px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold leading-5 text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-muted">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-[4px] border border-border bg-surface px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3.5">
          <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
            Title
            <input
              value={values.title}
              onChange={(event) =>
                setValues((current) => ({ ...current, title: event.target.value }))
              }
              className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
              placeholder="Task title"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Status
              <select
                value={values.status}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    status: event.target.value as TaskStatus,
                  }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-foreground"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Priority
              <select
                value={values.priority}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    priority: event.target.value as TaskPriority,
                  }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-foreground"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Assignee Name
              <input
                value={values.assigneeName}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    assigneeName: event.target.value,
                  }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                placeholder="Optional"
              />
            </label>

            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Assignee Initials
              <input
                value={values.assigneeInitials}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    assigneeInitials: event.target.value,
                  }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Due Date
              <input
                type="date"
                value={values.dueDate}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-foreground"
              />
            </label>

            <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
              Labels
              <input
                value={values.labels}
                onChange={(event) =>
                  setValues((current) => ({ ...current, labels: event.target.value }))
                }
                className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                placeholder="Comma separated"
              />
            </label>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-9 items-center rounded-[4px] bg-foreground px-4 text-[12px] font-medium text-background transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
    : null;
}
