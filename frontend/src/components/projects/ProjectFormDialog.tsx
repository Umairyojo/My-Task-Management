"use client";

import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { TaskPriority } from "@/components/tasks/types";
import type { Project, ProjectFormValues } from "./types";

interface ProjectFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
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

function createInitialValues(project: Project | undefined): ProjectFormValues {
  return {
    name: project?.name ?? "",
    priority: project?.priority ?? "medium",
    leadName: project?.leadName ?? "",
    dueDate: toDateInputValue(project?.dueDate),
  };
}

function normalizeValues(values: ProjectFormValues): ProjectFormValues {
  return {
    name: values.name.trim(),
    priority: values.priority,
    leadName: values.leadName.trim(),
    dueDate: values.dueDate.trim(),
  };
}

export function ProjectFormDialog({
  open,
  mode,
  project,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const [values, setValues] = useState(() => createInitialValues(project));
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

  const title = mode === "create" ? "Create Project" : "Edit Project";
  const submitLabel = mode === "create" ? "Create Project" : "Save Changes";
  const description =
    mode === "create"
      ? "Fill in the project details and add it to the workspace."
      : "Update the project details and save the changes.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (values.name.trim().length === 0) {
      setError("Project name is required.");
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
          : "Unable to save project.",
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
            className="my-auto w-full max-w-[540px] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[16px] border border-border bg-background p-4 shadow-[0_18px_44px_rgba(0,0,0,0.12)]"
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
                Project Name
                <input
                  value={values.name}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                  placeholder="Project name"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
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

                <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
                  Lead Name
                  <input
                    value={values.leadName}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        leadName: event.target.value,
                      }))
                    }
                    className="h-9 rounded-[6px] border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                    placeholder="Optional"
                  />
                </label>
              </div>

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
