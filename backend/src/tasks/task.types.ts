export const TASK_STATUSES = [
  'todo',
  'doing',
  'completed',
  'on-hold',
  'backlog',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = [
  'urgent',
  'high',
  'medium',
  'low',
  'no-priority',
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskResponse {
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

export interface SubtaskResponse {
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

export interface TaskCommentResponse {
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

export interface TaskActivityResponse {
  id: string;
  taskId: string;
  actorName: string;
  actorAvatar: string | null;
  type: string;
  message: string;
  createdAt: string;
}

export interface TaskDetailResponse extends TaskResponse {
  subtasks: SubtaskResponse[];
  comments: TaskCommentResponse[];
  activities: TaskActivityResponse[];
}
