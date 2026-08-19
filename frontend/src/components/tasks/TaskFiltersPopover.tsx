"use client";

import {
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { TaskFilters, TaskFilterOptions, DueDateFilter } from "./task-filters";
import {
  UNASSIGNED_FILTER_VALUE,
  dueDateFilterOptions,
  priorityFilterOptions,
  statusFilterOptions,
} from "./task-filters";

type FilterSectionKey = "status" | "priority" | "assignee" | "dueDate" | "labels";

interface TaskFiltersPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  filters: TaskFilters;
  options: TaskFilterOptions;
  onClose: () => void;
  onFiltersChange: Dispatch<SetStateAction<TaskFilters>>;
  onClearFilters: () => void;
}

const popoverWidth = 332;

function toggleSelection<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function OptionRow({
  label,
  selected,
  onClick,
  selectedVariant = "check",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  selectedVariant?: "check" | "radio";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-full items-center justify-between rounded-[4px] px-2 text-left text-[12px] text-foreground transition-colors hover:bg-surface"
      aria-pressed={selected}
    >
      <span className="truncate">{label}</span>
      <span
        className={[
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          selected ? "border-foreground bg-foreground text-background" : "border-border bg-background text-transparent",
          selectedVariant === "radio" ? "rounded-full" : "",
        ].join(" ")}
      >
        <Check className="h-3 w-3" aria-hidden="true" />
      </span>
    </button>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[6px] border border-border bg-background">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-full items-center justify-between gap-2 px-2 text-left text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          className={[
            "h-3.5 w-3.5 text-muted transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {open ? <div className="border-t border-border p-1">{children}</div> : null}
    </section>
  );
}

export function TaskFiltersPopover({
  open,
  anchorRef,
  filters,
  options,
  onClose,
  onFiltersChange,
  onClearFilters,
}: TaskFiltersPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [sectionOpen, setSectionOpen] = useState<Record<FilterSectionKey, boolean>>({
    status: true,
    priority: true,
    assignee: false,
    dueDate: false,
    labels: false,
  });

  const hasActiveFilters = useMemo(
    () =>
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0 ||
      filters.labels.length > 0 ||
      filters.dueDate !== "all",
    [filters],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const trigger = anchorRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const isCompactViewport = window.innerWidth < 640;
      const width = isCompactViewport
        ? window.innerWidth - 16
        : Math.min(popoverWidth, window.innerWidth - 16);
      const left = isCompactViewport
        ? 8
        : Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    };

    updatePosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        popoverRef.current &&
        anchorRef.current &&
        !popoverRef.current.contains(target) &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, onClose, open]);

  if (!open || !position || typeof document === "undefined") {
    return null;
  }

  const toggleStatus = (value: (typeof statusFilterOptions)[number]["value"]) => {
    onFiltersChange((current) => ({
      ...current,
      statuses: toggleSelection(current.statuses, value),
    }));
  };

  const togglePriority = (value: (typeof priorityFilterOptions)[number]["value"]) => {
    onFiltersChange((current) => ({
      ...current,
      priorities: toggleSelection(current.priorities, value),
    }));
  };

  const toggleAssignee = (value: string) => {
    onFiltersChange((current) => ({
      ...current,
      assignees: toggleSelection(current.assignees, value),
    }));
  };

  const toggleLabel = (value: string) => {
    onFiltersChange((current) => ({
      ...current,
      labels: toggleSelection(current.labels, value),
    }));
  };

  const setDueDate = (value: DueDateFilter) => {
    onFiltersChange((current) => ({
      ...current,
      dueDate: value,
    }));
  };

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Task filters"
      className="fixed z-50 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col overflow-hidden rounded-[8px] border border-border bg-background shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:w-[332px] sm:max-w-[332px]"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <p className="text-[12px] font-medium leading-4 text-foreground">Filter</p>
          <p className="text-[11px] leading-4 text-muted">Combine filters with search</p>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-7 items-center rounded-[4px] border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-background"
          >
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close filters"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        <Section
          title="Status"
          open={sectionOpen.status}
          onToggle={() =>
            setSectionOpen((current) => ({ ...current, status: !current.status }))
          }
        >
          <div className="space-y-1">
            {statusFilterOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={filters.statuses.includes(option.value)}
                onClick={() => toggleStatus(option.value)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Priority"
          open={sectionOpen.priority}
          onToggle={() =>
            setSectionOpen((current) => ({ ...current, priority: !current.priority }))
          }
        >
          <div className="space-y-1">
            {priorityFilterOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={filters.priorities.includes(option.value)}
                onClick={() => togglePriority(option.value)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Assignee"
          open={sectionOpen.assignee}
          onToggle={() =>
            setSectionOpen((current) => ({ ...current, assignee: !current.assignee }))
          }
        >
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {options.assignees.map((assignee) => (
              <OptionRow
                key={assignee}
                label={assignee}
                selected={filters.assignees.includes(assignee)}
                onClick={() => toggleAssignee(assignee)}
              />
            ))}
            {options.hasUnassigned ? (
              <OptionRow
                label="Unassigned"
                selected={filters.assignees.includes(UNASSIGNED_FILTER_VALUE)}
                onClick={() => toggleAssignee(UNASSIGNED_FILTER_VALUE)}
              />
            ) : null}
          </div>
        </Section>

        <Section
          title="Due Date"
          open={sectionOpen.dueDate}
          onToggle={() =>
            setSectionOpen((current) => ({ ...current, dueDate: !current.dueDate }))
          }
        >
          <div className="space-y-1">
            {dueDateFilterOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={filters.dueDate === option.value}
                selectedVariant="radio"
                onClick={() => setDueDate(option.value)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Labels"
          open={sectionOpen.labels}
          onToggle={() =>
            setSectionOpen((current) => ({ ...current, labels: !current.labels }))
          }
        >
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {options.labels.map((label) => (
              <OptionRow
                key={label}
                label={label}
                selected={filters.labels.includes(label)}
                onClick={() => toggleLabel(label)}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>,
    document.body,
  );
}
