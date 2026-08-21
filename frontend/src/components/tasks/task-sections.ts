import type { TaskSectionModel, TaskStatus } from "./types";

export const taskListSections: TaskSectionModel[] = [
  { key: "todo", title: "To Do" },
  { key: "on-hold", title: "On Hold" },
  { key: "doing", title: "Doing" },
  { key: "completed", title: "Completed" },
];

export const taskBoardSections: TaskSectionModel[] = [
  { key: "todo", title: "To Do" },
  { key: "on-hold", title: "On Hold" },
  { key: "doing", title: "Doing" },
  { key: "completed", title: "Completed" },
];

// Backlog is no longer a workspace state. Keep older records visible as To Do.
export function getWorkspaceTaskStatus(status: TaskStatus): Exclude<TaskStatus, "backlog"> {
  return status === "backlog" ? "todo" : status;
}

export function taskMatchesSection(taskStatus: TaskStatus, sectionStatus: TaskStatus): boolean {
  return getWorkspaceTaskStatus(taskStatus) === sectionStatus;
}
