import { ChevronDown, Filter, Search, Plus } from "lucide-react";

export function TaskToolbar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-foreground">
        Tasks
      </h1>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Search</span>
        </button>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
        >
          <span>Fields</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Filter</span>
        </button>

        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-foreground px-3 text-[13px] font-medium text-background transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
