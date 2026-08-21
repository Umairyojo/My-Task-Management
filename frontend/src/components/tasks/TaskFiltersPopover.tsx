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
import {
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Tag,
  UserRound,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { TaskFilters, TaskFilterOptions } from "./task-filters";
import type { TaskPriority } from "./types";
import {
  UNASSIGNED_FILTER_VALUE,
  dueDateFilterOptions,
  priorityFilterOptions,
  statusFilterOptions,
} from "./task-filters";

type FilterCategoryKey =
  | "status"
  | "priority"
  | "members"
  | "dueDate"
  | "teams"
  | "labels"
  | "reporter";

type SubmenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
  selectedToneClassName?: string;
  showRadio?: boolean;
};

interface TaskFiltersPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  filters: TaskFilters;
  options: TaskFilterOptions;
  onClose: () => void;
  onFiltersChange: Dispatch<SetStateAction<TaskFilters>>;
  onClearFilters: () => void;
}

const popoverWidth = 528;

function toggleSelection<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function PriorityBars({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={["inline-flex h-4 w-4 items-end justify-center gap-[1px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="h-1.5 w-0.5 rounded-full bg-current" />
      <span className="h-2.5 w-0.5 rounded-full bg-current" />
      <span className="h-3.5 w-0.5 rounded-full bg-current" />
      <span className="h-4 w-0.5 rounded-full bg-current" />
    </span>
  );
}

function CategoryIcon({ category }: { category: FilterCategoryKey }) {
  switch (category) {
    case "status":
      return <Circle className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    case "priority":
      return <PriorityBars className="text-foreground" />;
    case "members":
      return <Users className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    case "dueDate":
      return <CalendarDays className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    case "teams":
      return <UsersRound className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    case "labels":
      return <Tag className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    case "reporter":
      return <UserRound className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />;
    default:
      return null;
  }
}

function CategoryRow({
  label,
  category,
  active,
  onActivate,
}: {
  label: string;
  category: FilterCategoryKey;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      onPointerEnter={onActivate}
      onFocus={onActivate}
      aria-pressed={active}
      className={[
        "flex h-10 w-full items-center justify-between rounded-[6px] px-2.5 text-left text-[12px] transition-colors",
        active ? "bg-surface" : "hover:bg-surface",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-2.5 text-foreground">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <CategoryIcon category={category} />
        </span>
        <span className="truncate font-medium">{label}</span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
    </button>
  );
}

function OptionRow({
  label,
  icon,
  selected,
  onClick,
  selectedToneClassName,
  showRadio = false,
}: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
  selectedToneClassName?: string;
  showRadio?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-between rounded-[6px] px-2.5 text-left text-[12px] transition-colors hover:bg-surface"
      aria-pressed={selected}
    >
      <span className="flex min-w-0 items-center gap-2.5 text-foreground">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {showRadio ? (
        <span
          className={[
            "inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-transparent",
          ].join(" ")}
        >
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : (
        <span
          className={[
            "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[3px] border",
            selected
              ? ["border-transparent bg-transparent", selectedToneClassName ?? "text-foreground"].join(
                  " ",
                )
              : "border-border bg-background text-transparent",
          ].join(" ")}
        >
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

const priorityToneClassNames: Record<TaskPriority, string> = {
  urgent: "text-red-600",
  high: "text-red-500",
  medium: "text-orange-500",
  low: "text-zinc-400 dark:text-zinc-300",
  "no-priority": "text-muted",
};

const prioritySelectedToneClassNames: Record<TaskPriority, string> = {
  urgent: "text-red-600",
  high: "text-red-500",
  medium: "text-orange-500",
  low: "text-muted",
  "no-priority": "text-muted",
};

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
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<FilterCategoryKey | null>(null);
  const closeSubmenuTimeoutRef = useRef<number | null>(null);
  const requiredPopoverWidth = activeCategory ? popoverWidth : 336;

  const cancelScheduledSubmenuClose = () => {
    if (closeSubmenuTimeoutRef.current !== null) {
      window.clearTimeout(closeSubmenuTimeoutRef.current);
      closeSubmenuTimeoutRef.current = null;
    }
  };

  const scheduleSubmenuClose = () => {
    cancelScheduledSubmenuClose();
    closeSubmenuTimeoutRef.current = window.setTimeout(() => {
      setActiveCategory(null);
      closeSubmenuTimeoutRef.current = null;
    }, 120);
  };

  const hasActiveFilters = useMemo(
    () =>
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0 ||
      filters.labels.length > 0 ||
      filters.dueDate !== "all",
    [filters],
  );

  const submenuItems = useMemo<Record<FilterCategoryKey, SubmenuItem[]>>(() => {
    const assigneeItems: SubmenuItem[] = options.assignees.map((assignee) => ({
      key: assignee,
      label: assignee,
      selected: filters.assignees.includes(assignee),
      onClick: () => {
        onFiltersChange((current) => ({
          ...current,
          assignees: toggleSelection(current.assignees, assignee),
        }));
      },
      icon: <UserRound className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />,
    }));

    if (options.hasUnassigned) {
      assigneeItems.push({
        key: UNASSIGNED_FILTER_VALUE,
        label: "Unassigned",
        selected: filters.assignees.includes(UNASSIGNED_FILTER_VALUE),
        onClick: () => {
          onFiltersChange((current) => ({
            ...current,
            assignees: toggleSelection(current.assignees, UNASSIGNED_FILTER_VALUE),
          }));
        },
        icon: <UserRound className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />,
      });
    }

    return {
      status: statusFilterOptions.map((option) => ({
        key: option.value,
        label: option.label,
        selected: filters.statuses.includes(option.value),
        onClick: () => {
          onFiltersChange((current) => ({
            ...current,
            statuses: toggleSelection(current.statuses, option.value),
          }));
        },
        icon: <Circle className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />,
      })),
      priority: priorityFilterOptions.map((option) => ({
        key: option.value,
        label: option.label,
        selected: filters.priorities.includes(option.value),
        onClick: () => {
          onFiltersChange((current) => ({
            ...current,
            priorities: toggleSelection(current.priorities, option.value),
          }));
        },
        icon: <PriorityBars className={priorityToneClassNames[option.value]} />,
        selectedToneClassName: prioritySelectedToneClassNames[option.value],
      })),
      members: assigneeItems,
      dueDate: dueDateFilterOptions.map((option) => ({
        key: option.value,
        label: option.label,
        selected: filters.dueDate === option.value,
        onClick: () => {
          onFiltersChange((current) => ({
            ...current,
            dueDate: option.value,
          }));
        },
        icon: <CalendarDays className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />,
        showRadio: true,
      })),
      teams: [],
      labels: options.labels.map((label) => ({
        key: label,
        label,
        selected: filters.labels.includes(label),
        onClick: () => {
          onFiltersChange((current) => ({
            ...current,
            labels: toggleSelection(current.labels, label),
          }));
        },
        icon: <Tag className="h-3.5 w-3.5 stroke-[1.75]" aria-hidden="true" />,
      })),
      reporter: [],
    };
  }, [
    filters.assignees,
    filters.dueDate,
    filters.labels,
    filters.priorities,
    filters.statuses,
    onFiltersChange,
    options.assignees,
    options.hasUnassigned,
    options.labels,
  ]);

  useEffect(() => {
    const updatePosition = () => {
      const trigger = anchorRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const isCompactViewport = window.innerWidth < 640;
      const width = isCompactViewport
        ? window.innerWidth - 16
        : Math.min(requiredPopoverWidth, window.innerWidth - 16);
      const left = isCompactViewport
        ? 8
        : Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));

      setPosition({
        top: rect.bottom + 8,
        left,
        width,
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
  }, [activeCategory, anchorRef, onClose, open, requiredPopoverWidth]);

  useEffect(() => {
    if (!open) {
      setActiveCategory(null);
    }

    return () => cancelScheduledSubmenuClose();
  }, [open]);

  if (!open || !position || typeof document === "undefined") {
    return null;
  }

  const activeItems = activeCategory ? submenuItems[activeCategory] : [];
  const categoryLabelMap: Record<FilterCategoryKey, string> = {
    status: "Status",
    priority: "Priority",
    members: "Members",
    dueDate: "Due Date",
    teams: "Teams",
    labels: "Labels",
    reporter: "Reporter",
  };

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Task filters"
      className="fixed z-50 max-h-[calc(100dvh-1rem)] overflow-hidden rounded-[10px] border border-border bg-background shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
      style={{
        top: position.top,
        left: position.left,
        width: `${position.width}px`,
      }}
    >
      <div className="flex min-h-0 w-full flex-col-reverse sm:flex-row">
        {activeCategory ? (
          <div
            className="min-h-0 w-full border-border sm:w-[192px] sm:border-r"
            onPointerEnter={cancelScheduledSubmenuClose}
            onPointerLeave={scheduleSubmenuClose}
          >
            <div className="px-3 pt-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                {categoryLabelMap[activeCategory]}
              </p>
            </div>

            <div className="min-h-0 space-y-1 overflow-y-auto p-2.5 pt-2">
              {activeItems.length > 0 ? (
                activeItems.map((item) => (
                  <OptionRow
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    selected={item.selected}
                    onClick={item.onClick}
                    selectedToneClassName={item.selectedToneClassName}
                    showRadio={item.showRadio}
                  />
                ))
              ) : (
                <div className="rounded-[6px] border border-dashed border-border px-3 py-2 text-[11px] leading-4 text-muted">
                  No options available yet.
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 w-full flex-col sm:w-[336px]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
            <div>
              <p className="text-[12px] font-medium leading-4 text-foreground">Filter</p>
              <p className="text-[11px] leading-4 text-muted">Combine filters with search</p>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex h-7 items-center rounded-[4px] border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-background"
                >
                  Clear filters
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="min-h-0 space-y-1 overflow-y-auto overscroll-contain p-2.5"
            onPointerEnter={cancelScheduledSubmenuClose}
            onPointerLeave={scheduleSubmenuClose}
          >
            <CategoryRow
              label="Status"
              category="status"
              active={activeCategory === "status"}
              onActivate={() => setActiveCategory("status")}
            />
            <CategoryRow
              label="Priority"
              category="priority"
              active={activeCategory === "priority"}
              onActivate={() => setActiveCategory("priority")}
            />
            <CategoryRow
              label="Members"
              category="members"
              active={activeCategory === "members"}
              onActivate={() => setActiveCategory("members")}
            />
            <CategoryRow
              label="Due Date"
              category="dueDate"
              active={activeCategory === "dueDate"}
              onActivate={() => setActiveCategory("dueDate")}
            />
            <CategoryRow
              label="Teams"
              category="teams"
              active={activeCategory === "teams"}
              onActivate={() => setActiveCategory("teams")}
            />
            <CategoryRow
              label="Labels"
              category="labels"
              active={activeCategory === "labels"}
              onActivate={() => setActiveCategory("labels")}
            />
            <CategoryRow
              label="Reporter"
              category="reporter"
              active={activeCategory === "reporter"}
              onActivate={() => setActiveCategory("reporter")}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
