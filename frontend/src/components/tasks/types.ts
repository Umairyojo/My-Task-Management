export type TaskStatus = "todo" | "doing" | "completed" | "on-hold" | "backlog";

export type TaskViewMode = "list" | "board";

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "no-priority";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string | null;
  assigneeName: string | null;
  assigneeInitials: string | null;
  startDate: string | null;
  dueDate: string | null;
  labels: string[];
  teams: string[];
  resources: string[];
  reporterName: string | null;
  reporterAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  priority: TaskPriority;
  assigneeName: string | null;
  assigneeInitials: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorAvatar: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorName: string;
  actorAvatar: string | null;
  type: string;
  message: string;
  createdAt: string;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  comments: TaskComment[];
  activities: TaskActivity[];
}

export interface TaskSectionModel {
  key: TaskStatus;
  title: string;
}
