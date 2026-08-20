"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import type { TaskViewMode } from "./types";
import { taskBoardSections, taskListSections } from "./task-sections";

interface TasksLoadingStateProps {
  viewMode: TaskViewMode;
}

interface TasksErrorStateProps {
  onRetry: () => void;
}

interface TasksEmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface TasksNoMatchStateProps {
  message: string;
  actions: Array<{
    label: string;
    onAction: () => void;
  }>;
}

function ListSkeleton() {
  return (
    <div className="flex w-full min-w-[760px] flex-col gap-2.5">
      {taskListSections.map((section) => (
        <section key={section.key} className="space-y-1.5">
          <div className="flex h-6 items-center gap-1.5 px-1">
            <div className="h-4 w-4 rounded-full bg-surface animate-pulse" />
            <div className="h-3 w-20 rounded-full bg-surface animate-pulse" />
          </div>

          <div className="overflow-hidden rounded-[8px] border border-border bg-background">
            <div className="border-b border-border bg-surface/80 px-4 py-2">
              <div className="grid grid-cols-[46%_16%_18%_14%_6%] gap-3">
                <div className="h-3.5 rounded-full bg-border/70 animate-pulse" />
                <div className="h-3.5 rounded-full bg-border/70 animate-pulse" />
                <div className="h-3.5 rounded-full bg-border/70 animate-pulse" />
                <div className="h-3.5 rounded-full bg-border/70 animate-pulse" />
                <div className="h-3.5 rounded-full bg-border/70 animate-pulse" />
              </div>
            </div>

            <div className="space-y-0">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`${section.key}-skeleton-${index}`}
                  className="grid grid-cols-[46%_16%_18%_14%_6%] gap-3 border-t border-border px-4 py-2"
                >
                  <div className="h-3.5 rounded-full bg-surface animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-surface animate-pulse" />
                  <div className="h-6 w-20 rounded-full bg-surface animate-pulse" />
                  <div className="h-3.5 w-16 rounded-full bg-surface animate-pulse" />
                  <div className="justify-self-end h-6 w-6 rounded-md bg-surface animate-pulse" />
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-2">
              <div className="h-3.5 w-20 rounded-full bg-surface animate-pulse" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex w-max min-w-full gap-2.5">
      {taskBoardSections.map((section) => (
        <section
          key={section.key}
          className="flex w-[289px] shrink-0 flex-col rounded-[8px] border border-border bg-surface"
        >
          <div className="flex h-10 items-center justify-between gap-3 border-b border-border px-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-border/70 animate-pulse" />
              <div className="h-3.5 w-16 rounded-full bg-border/70 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <div className="h-7 w-7 rounded-md bg-border/70 animate-pulse" />
              <div className="h-7 w-7 rounded-md bg-border/70 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5 p-2.5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`${section.key}-card-${index}`}
                className="rounded-[8px] border border-border bg-background px-3 py-2.5"
              >
                <div className="h-3.5 w-36 rounded-full bg-surface animate-pulse" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="h-6 w-24 rounded-full bg-surface animate-pulse" />
                  <div className="h-6 w-20 rounded-full bg-surface animate-pulse" />
                </div>
                <div className="mt-3 flex gap-1.5">
                  <div className="h-5 w-12 rounded-full bg-surface animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-surface animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TasksLoadingState({ viewMode }: TasksLoadingStateProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 overflow-x-auto pb-1">
        {viewMode === "list" ? <ListSkeleton /> : <BoardSkeleton />}
      </div>
    </div>
  );
}

export function TasksEmptyState({
  message = "No tasks yet.",
  actionLabel,
  onAction,
}: TasksEmptyStateProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start pt-4">
      <div className="rounded-[8px] border border-border bg-surface px-4 py-3 text-[13px] text-muted">
        <p>{message}</p>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 inline-flex h-8 items-center rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function TasksErrorState({ onRetry }: TasksErrorStateProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start pt-4">
      <div className="flex max-w-[360px] items-start gap-3 rounded-[8px] border border-border bg-background px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">Unable to load tasks.</p>
          <p className="mt-1 text-[12px] leading-4 text-muted">
            Check that the backend is running, then try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export function TasksNoMatchState({
  message,
  actions,
}: TasksNoMatchStateProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start pt-4">
      <div className="rounded-[8px] border border-border bg-surface px-4 py-3 text-[13px] text-muted">
        <p>{message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onAction}
              className="inline-flex h-8 items-center rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
