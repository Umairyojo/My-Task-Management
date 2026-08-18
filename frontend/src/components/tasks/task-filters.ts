import type { Task, TaskPriority, TaskStatus } from "./types";

export type DueDateFilter = "all" | "overdue" | "today" | "this-week" | "no-date";

export interface TaskFilters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assignees: string[];
  labels: string[];
  dueDate: DueDateFilter;
}

export interface TaskFilterOptions {
  assignees: string[];
  labels: string[];
  hasUnassigned: boolean;
}

export const UNASSIGNED_FILTER_VALUE = "__unassigned__";

export const defaultTaskFilters: TaskFilters = {
  statuses: [],
  priorities: [],
  assignees: [],
  labels: [],
  dueDate: "all",
};

export const statusFilterOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "To Do" },
  { value: "doing", label: "Doing" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

export const priorityFilterOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const dueDateFilterOptions: Array<{ value: DueDateFilter; label: string }> = [
  { value: "all", label: "All dates" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "this-week", label: "Due this week" },
  { value: "no-date", label: "No due date" },
];

function normalizeComparableText(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueSortedValues(values: string[]): string[] {
  const normalizedValues = new Map<string, string>();

  for (const value of values) {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      continue;
    }

    const normalizedValue = normalizeComparableText(trimmedValue);

    if (!normalizedValues.has(normalizedValue)) {
      normalizedValues.set(normalizedValue, trimmedValue);
    }
  }

  return Array.from(normalizedValues.values()).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: "base" }),
  );
}

function startOfLocalDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfLocalWeek(date: Date): Date {
  const result = startOfLocalDay(date);
  const dayIndex = result.getDay();
  const offsetFromMonday = (dayIndex + 6) % 7;
  result.setDate(result.getDate() - offsetFromMonday);
  return result;
}

function parseTaskDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function getTaskFilterOptions(tasks: Task[]): TaskFilterOptions {
  const assigneeValues: string[] = [];
  const labelValues: string[] = [];
  let hasUnassigned = false;

  for (const task of tasks) {
    if (task.assigneeName) {
      assigneeValues.push(task.assigneeName);
    } else {
      hasUnassigned = true;
    }

    labelValues.push(...task.labels);
  }

  return {
    assignees: uniqueSortedValues(assigneeValues),
    labels: uniqueSortedValues(labelValues),
    hasUnassigned,
  };
}

export function hasActiveTaskFilters(filters: TaskFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.labels.length > 0 ||
    filters.dueDate !== "all"
  );
}

export function countActiveTaskFilterCategories(filters: TaskFilters): number {
  let count = 0;

  if (filters.statuses.length > 0) {
    count += 1;
  }

  if (filters.priorities.length > 0) {
    count += 1;
  }

  if (filters.assignees.length > 0) {
    count += 1;
  }

  if (filters.labels.length > 0) {
    count += 1;
  }

  if (filters.dueDate !== "all") {
    count += 1;
  }

  return count;
}

export function taskMatchesTaskFilters(
  task: Task,
  filters: TaskFilters,
  now = new Date(),
): boolean {
  if (
    filters.statuses.length > 0 &&
    !filters.statuses.includes(task.status)
  ) {
    return false;
  }

  if (
    filters.priorities.length > 0 &&
    !filters.priorities.includes(task.priority)
  ) {
    return false;
  }

  if (filters.assignees.length > 0) {
    const normalizedTaskAssignee = task.assigneeName
      ? normalizeComparableText(task.assigneeName)
      : null;
    const matchesAssignee = filters.assignees.some((assignee) => {
      if (assignee === UNASSIGNED_FILTER_VALUE) {
        return task.assigneeName === null || task.assigneeName.trim().length === 0;
      }

      return (
        normalizedTaskAssignee !== null &&
        normalizedTaskAssignee === normalizeComparableText(assignee)
      );
    });

    if (!matchesAssignee) {
      return false;
    }
  }

  if (filters.labels.length > 0) {
    const selectedLabels = new Set(
      filters.labels.map((label) => normalizeComparableText(label)),
    );

    const matchesLabel = task.labels.some((label) =>
      selectedLabels.has(normalizeComparableText(label)),
    );

    if (!matchesLabel) {
      return false;
    }
  }

  if (filters.dueDate !== "all") {
    const taskDate = parseTaskDate(task.dueDate);
    const today = startOfLocalDay(now);

    if (filters.dueDate === "no-date") {
      return taskDate === null;
    }

    if (taskDate === null) {
      return false;
    }

    const taskLocalDay = startOfLocalDay(taskDate);

    if (filters.dueDate === "overdue") {
      return taskLocalDay < today;
    }

    if (filters.dueDate === "today") {
      return isSameLocalDay(taskLocalDay, today);
    }

    if (filters.dueDate === "this-week") {
      const weekStart = startOfLocalWeek(now);
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(weekStart.getDate() + 7);

      return taskLocalDay >= weekStart && taskLocalDay < nextWeekStart;
    }
  }

  return true;
}
