"use client";

import { AlertCircle, Plus, RefreshCcw } from "lucide-react";

export function ProjectsLoadingState() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-background">
      <div className="bg-surface px-4 py-2">
        <div className="grid grid-cols-[36%_18%_20%_18%_8%] gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-3.5 rounded-full bg-border/70 animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[36%_18%_20%_18%_8%] gap-3 border-t border-border px-4 py-3"
          >
            <div className="h-3.5 rounded-full bg-surface animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-surface animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-surface animate-pulse" />
            <div className="h-3.5 w-16 rounded-full bg-surface animate-pulse" />
            <div className="justify-self-end h-6 w-6 rounded-md bg-surface animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsEmptyState({
  onAction,
}: {
  onAction: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start pt-6">
      <div className="rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-muted">
        <p>No projects yet.</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Project
        </button>
      </div>
    </div>
  );
}

export function ProjectsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-start pt-6">
      <div className="flex max-w-[420px] items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">Unable to load projects.</p>
          <p className="mt-1 text-[12px] leading-4 text-muted">{message}</p>
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
