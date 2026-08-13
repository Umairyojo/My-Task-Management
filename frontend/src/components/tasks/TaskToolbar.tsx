"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react";
import type { TaskViewMode } from "./types";

interface TaskToolbarProps {
  viewMode: TaskViewMode;
  onViewModeChange: (viewMode: TaskViewMode) => void;
}

const fieldOptions = [
  { label: "Priority", checked: true },
  { label: "Members", checked: true },
  { label: "Due Date", checked: true },
  { label: "Labels", checked: true },
  { label: "Status", checked: true },
  { label: "Reporter", checked: false },
] as const;

export function TaskToolbar({
  viewMode,
  onViewModeChange,
}: TaskToolbarProps) {
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const fieldsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFieldsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        fieldsPanelRef.current &&
        !fieldsPanelRef.current.contains(target)
      ) {
        setIsFieldsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isFieldsOpen]);

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-foreground">
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

        <div ref={fieldsPanelRef} className="relative">
          <button
            type="button"
            aria-expanded={isFieldsOpen}
            aria-haspopup="dialog"
            onClick={() => setIsFieldsOpen((current) => !current)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            <span>Fields</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          </button>

          {isFieldsOpen ? (
            <div className="absolute right-0 top-full z-20 mt-2 w-[264px] rounded-lg border border-border bg-background p-3 shadow-sm">
              <div className="flex rounded-md border border-border bg-surface p-0.5 text-[12px] font-medium text-muted">
                <button
                  type="button"
                  aria-pressed={viewMode === "list"}
                  onClick={() => {
                    onViewModeChange("list");
                    setIsFieldsOpen(false);
                  }}
                  className={[
                    "flex h-7 flex-1 items-center justify-center rounded-[4px] transition-colors",
                    viewMode === "list" ? "bg-background text-foreground" : "",
                  ].join(" ")}
                >
                  <List className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  List
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "board"}
                  onClick={() => {
                    onViewModeChange("board");
                    setIsFieldsOpen(false);
                  }}
                  className={[
                    "flex h-7 flex-1 items-center justify-center rounded-[4px] transition-colors",
                    viewMode === "board" ? "bg-background text-foreground" : "",
                  ].join(" ")}
                >
                  <LayoutGrid className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Board
                </button>
              </div>

              <div className="mt-3 space-y-1">
                {fieldOptions.map((option) => (
                  <div
                    key={option.label}
                    className="flex h-8 items-center justify-between rounded-md px-2 text-[12px] text-foreground hover:bg-surface"
                  >
                    <span>{option.label}</span>
                    <span
                      className={[
                        "inline-flex h-4 w-4 items-center justify-center rounded-[3px] border",
                        option.checked
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-transparent",
                      ].join(" ")}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

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
