export const TASK_STATUSES = ['todo', 'doing', 'completed', 'on-hold'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskResponse {
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
