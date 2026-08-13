export type TaskStatus = "todo" | "doing" | "completed" | "on-hold";

export type TaskViewMode = "list" | "board";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string | null;
  assigneeInitials: string | null;
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSectionModel {
  key: TaskStatus;
  title: string;
}
