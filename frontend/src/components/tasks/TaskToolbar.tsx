"use client";

import {
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import { FieldsMark } from "@/components/layout/app-icons";
import { TaskFiltersPopover } from "./TaskFiltersPopover";
import { countActiveTaskFilterCategories } from "./task-filters";
import type { TaskFilterOptions, TaskFilters } from "./task-filters";
import { taskFieldOptions } from "./task-fields";
import type { TaskFieldVisibility } from "./task-fields";
import type { TaskViewMode } from "./types";

interface TaskToolbarProps {
  viewMode: TaskViewMode;
  onViewModeChange: (viewMode: TaskViewMode) => void;
  onAddTask: () => void;
  searchQuery: string;
  isSearchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
  onClearSearch: () => void;
  filters: TaskFilters;
  filterOptions: TaskFilterOptions;
  onFiltersChange: Dispatch<SetStateAction<TaskFilters>>;
  onClearFilters: () => void;
  fieldVisibility: TaskFieldVisibility;
  onFieldVisibilityChange: Dispatch<SetStateAction<TaskFieldVisibility>>;
}

function getKeyboardHint() {
  if (typeof navigator === "undefined") {
    return "Ctrl+F";
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "Cmd+F" : "Ctrl+F";
}

export function TaskToolbar({
  viewMode,
  onViewModeChange,
  onAddTask,
  searchQuery,
  isSearchOpen,
  onSearchOpenChange,
  onSearchQueryChange,
  onClearSearch,
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters,
  fieldVisibility,
  onFieldVisibilityChange,
}: TaskToolbarProps) {
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fieldsPanelRef = useRef<HTMLDivElement>(null);
  const fieldsPopoverRef = useRef<HTMLDivElement>(null);
  const [fieldsPopoverPosition, setFieldsPopoverPosition] = useState<{
    top: number;
    left: number;
    right?: number;
    width?: number;
  } | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasSearchQuery = searchQuery.trim().length > 0;
  const activeFilterCount = countActiveTaskFilterCategories(filters);
  const hasActiveFilters = activeFilterCount > 0;
  const keyboardHint = getKeyboardHint();

  useEffect(() => {
    if (!isFieldsOpen) {
      return;
    }

    const updateFieldsPopoverPosition = () => {
      const trigger = fieldsPanelRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const isCompactViewport = window.innerWidth < 640;
      const availableWidth = Math.max(0, window.innerWidth - 16);

      if (isCompactViewport) {
        setFieldsPopoverPosition({
          top: rect.bottom + 8,
          left: 8,
          right: 8,
        });
        return;
      }

      const width = Math.min(264, availableWidth);
      const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));

      setFieldsPopoverPosition({
        top: rect.bottom + 8,
        left,
        width,
      });
    };

    updateFieldsPopoverPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        fieldsPanelRef.current &&
        fieldsPopoverRef.current &&
        !fieldsPanelRef.current.contains(target) &&
        !fieldsPopoverRef.current.contains(target)
      ) {
        setIsFieldsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFieldsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateFieldsPopoverPosition);
    window.addEventListener("scroll", updateFieldsPopoverPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateFieldsPopoverPosition);
      window.removeEventListener("scroll", updateFieldsPopoverPosition, true);
    };
  }, [isFieldsOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        searchPanelRef.current &&
        !searchPanelRef.current.contains(target) &&
        !hasSearchQuery
      ) {
        onSearchOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [hasSearchQuery, isSearchOpen, onSearchOpenChange]);

  const handleSearchInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") {
      return;
    }

    if (searchQuery.trim().length > 0) {
      return;
    }

    event.preventDefault();
    onSearchOpenChange(false);
  };

  const handleFilterButtonClick = () => {
    setIsFieldsOpen(false);
    setIsFilterOpen((current) => !current);
  };

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <h1 className="text-[17px] font-semibold leading-5 tracking-[-0.02em] text-foreground sm:text-[18px]">
        Tasks
      </h1>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div ref={searchPanelRef}>
          {isSearchOpen ? (
            <div className="flex h-9 w-full max-w-[373px] items-center gap-2 rounded-[4px] border border-border bg-background px-2.5 sm:h-8">
              <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                placeholder="Search tasks"
                aria-label="Search tasks"
                data-task-search-input="true"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted"
              />
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted">
                  {keyboardHint}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (hasSearchQuery) {
                      onClearSearch();
                      return;
                    }

                    onSearchOpenChange(false);
                  }}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                  aria-label={hasSearchQuery ? "Clear search" : "Close search"}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSearchOpenChange(true)}
              aria-label="Search tasks"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-foreground sm:h-8 sm:w-8"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div ref={fieldsPanelRef} className="relative">
          <button
            type="button"
            aria-expanded={isFieldsOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setIsFilterOpen(false);
              setIsFieldsOpen((current) => !current);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-surface sm:h-8"
          >
            <FieldsMark className="h-3.5 w-3.5 shrink-0" />
            <span>Fields</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          </button>

          {isFieldsOpen && fieldsPopoverPosition && typeof document !== "undefined"
            ? createPortal(
                <div
                  ref={fieldsPopoverRef}
                  role="dialog"
                  aria-label="Task fields"
                  className="fixed z-50 flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[8px] border border-border bg-background p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
                  style={{
                    top: fieldsPopoverPosition.top,
                    left: fieldsPopoverPosition.left,
                    right: fieldsPopoverPosition.right,
                    width: fieldsPopoverPosition.right
                      ? "auto"
                      : `${fieldsPopoverPosition.width ?? 264}px`,
                    maxWidth: fieldsPopoverPosition.right
                      ? "calc(100vw - 1rem)"
                      : `${fieldsPopoverPosition.width ?? 264}px`,
                  }}
                >
                  <div className="flex rounded-[6px] border border-border bg-surface p-0.5 text-[11px] font-medium text-muted">
                    <button
                      type="button"
                      aria-pressed={viewMode === "list"}
                      onClick={() => {
                        onViewModeChange("list");
                        setIsFieldsOpen(false);
                      }}
                      className={[
                        "flex h-7 min-w-0 flex-1 items-center justify-center rounded-[4px] transition-colors",
                        viewMode === "list" ? "bg-background text-foreground" : "",
                      ].join(" ")}
                    >
                      <List className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">List</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={viewMode === "board"}
                      onClick={() => {
                        onViewModeChange("board");
                        setIsFieldsOpen(false);
                      }}
                      className={[
                        "flex h-7 min-w-0 flex-1 items-center justify-center rounded-[4px] transition-colors",
                        viewMode === "board" ? "bg-background text-foreground" : "",
                      ].join(" ")}
                    >
                      <LayoutGrid className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">Board</span>
                    </button>
                  </div>

                  <div className="mt-2.5 min-h-0 space-y-1 overflow-y-auto">
                    {taskFieldOptions.map((option) => {
                      const checked = fieldVisibility[option.key];

                      return (
                        <button
                          key={option.key}
                          type="button"
                          aria-pressed={checked}
                          onClick={() =>
                            onFieldVisibilityChange((current) => ({
                              ...current,
                              [option.key]: !current[option.key],
                            }))
                          }
                          className="flex h-8 w-full items-center justify-between rounded-[6px] px-2 text-[12px] text-foreground transition-colors hover:bg-surface"
                        >
                          <span className="truncate">{option.label}</span>
                          <span
                            className={[
                              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
                              checked
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-transparent",
                            ].join(" ")}
                          >
                            <Check className="h-3 w-3" aria-hidden="true" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>,
                document.body,
              )
            : null}
        </div>

        <div className="relative">
          <button
            ref={filterButtonRef}
            type="button"
            onClick={handleFilterButtonClick}
            aria-label="Filter tasks"
            aria-haspopup="dialog"
            aria-expanded={isFilterOpen}
            className={[
              "relative inline-flex h-9 w-9 items-center justify-center rounded-[4px] border transition-colors sm:h-8 sm:w-8",
              hasActiveFilters
                ? "border-border bg-surface text-foreground"
                : "border-border bg-background text-muted hover:bg-surface hover:text-foreground",
            ].join(" ")}
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            {hasActiveFilters ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none text-background">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <TaskFiltersPopover
            open={isFilterOpen}
            anchorRef={filterButtonRef}
            filters={filters}
            options={filterOptions}
            onClose={() => setIsFilterOpen(false)}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
          />
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-foreground px-3 text-[13px] font-medium text-background transition-colors hover:opacity-90 sm:h-8"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
