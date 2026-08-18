import type { Task } from "./types";

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeTaskSearchQuery(searchQuery: string): string {
  return normalizeSearchValue(searchQuery);
}

export function taskMatchesSearch(task: Task, searchQuery: string): boolean {
  const normalizedQuery = normalizeSearchValue(searchQuery);

  if (normalizedQuery.length === 0) {
    return true;
  }

  const searchableValues = [
    task.title,
    task.assigneeName ?? "",
    task.assigneeInitials ?? "",
    ...task.labels,
  ];

  return searchableValues.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}
