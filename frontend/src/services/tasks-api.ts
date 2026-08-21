import type {
  Subtask,
  Task,
  TaskActivity,
  TaskComment,
  TaskDetail,
  TaskPriority,
  TaskStatus,
} from "@/components/tasks/types";

export class TaskApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TaskApiError";
    this.status = status;
  }
}

export interface TaskWriteInput {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  assigneeInitials: string;
  dueDate: string;
  labels: string[];
}

export interface TaskActorInput {
  actorName: string;
  actorAvatar?: string | null;
}

export interface TaskDetailUpdateInput extends TaskActorInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeName?: string;
  assigneeInitials?: string;
  startDate?: string;
  dueDate?: string;
  labels?: string[];
  teams?: string[];
  resources?: string[];
  reporterName?: string;
  reporterAvatar?: string | null;
}

export interface SubtaskWriteInput extends TaskActorInput {
  title: string;
  priority?: TaskPriority;
  assigneeName?: string;
  assigneeInitials?: string;
  dueDate?: string;
}

export interface TaskCommentWriteInput {
  body: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string | null;
  parentId?: string;
}

function getTasksApiUrl(path: string): string {
  return `/api/tasks${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (value.status === "todo" ||
      value.status === "doing" ||
      value.status === "completed" ||
      value.status === "on-hold" ||
      value.status === "backlog") &&
    (value.priority === "urgent" ||
      value.priority === "high" ||
      value.priority === "medium" ||
      value.priority === "low" ||
      value.priority === "no-priority") &&
    (value.description === null || typeof value.description === "string") &&
    (value.assigneeName === null || typeof value.assigneeName === "string") &&
    (value.assigneeInitials === null ||
      typeof value.assigneeInitials === "string") &&
    (value.startDate === null || typeof value.startDate === "string") &&
    (value.dueDate === null || typeof value.dueDate === "string") &&
    Array.isArray(value.labels) &&
    value.labels.every((label) => typeof label === "string") &&
    Array.isArray(value.teams) &&
    value.teams.every((team) => typeof team === "string") &&
    Array.isArray(value.resources) &&
    value.resources.every((resource) => typeof resource === "string") &&
    (value.reporterName === null || typeof value.reporterName === "string") &&
    (value.reporterAvatar === null || typeof value.reporterAvatar === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isSubtask(value: unknown): value is Subtask {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.taskId === "string" &&
    typeof value.title === "string" &&
    typeof value.priority === "string" &&
    (value.assigneeName === null || typeof value.assigneeName === "string") &&
    (value.assigneeInitials === null || typeof value.assigneeInitials === "string") &&
    (value.dueDate === null || typeof value.dueDate === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isTaskComment(value: unknown): value is TaskComment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.taskId === "string" &&
    (value.parentId === null || typeof value.parentId === "string") &&
    typeof value.authorName === "string" &&
    typeof value.authorEmail === "string" &&
    (value.authorAvatar === null || typeof value.authorAvatar === "string") &&
    typeof value.body === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isTaskActivity(value: unknown): value is TaskActivity {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.taskId === "string" &&
    typeof value.actorName === "string" &&
    (value.actorAvatar === null || typeof value.actorAvatar === "string") &&
    typeof value.type === "string" &&
    typeof value.message === "string" &&
    typeof value.createdAt === "string"
  );
}

function isTaskDetail(value: unknown): value is TaskDetail {
  if (!isTask(value) || !isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.subtasks) &&
    value.subtasks.every(isSubtask) &&
    Array.isArray(value.comments) &&
    value.comments.every(isTaskComment) &&
    Array.isArray(value.activities) &&
    value.activities.every(isTaskActivity)
  );
}

async function parseTaskResponse(
  response: Response,
  fallbackMessage: string,
): Promise<Task> {
  if (!response.ok) {
    throw new TaskApiError(`${fallbackMessage} (${response.status}).`, response.status);
  }

  const data: unknown = await response.json();

  if (!isTask(data)) {
    throw new Error("Unexpected task response from the API.");
  }

  return data;
}

function buildTaskRequestBody(input: TaskWriteInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: input.title.trim(),
    status: input.status,
    priority: input.priority,
    labels: input.labels.map((label) => label.trim()).filter(Boolean),
  };

  const assigneeName = input.assigneeName.trim();
  const assigneeInitials = input.assigneeInitials.trim();
  const dueDate = input.dueDate.trim();

  if (assigneeName.length > 0) {
    body.assigneeName = assigneeName;
  }

  if (assigneeInitials.length > 0) {
    body.assigneeInitials = assigneeInitials.toUpperCase();
  }

  if (dueDate.length > 0) {
    body.dueDate = dueDate;
  }

  return body;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(getTasksApiUrl(""), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load tasks (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || !data.every(isTask)) {
    throw new Error("Unexpected tasks response from the API.");
  }

  return data;
}

export async function getTask(id: string): Promise<TaskDetail> {
  const response = await fetch(getTasksApiUrl(`/${id}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new TaskApiError(`Unable to load task (${response.status}).`, response.status);
  }

  const data: unknown = await response.json();

  if (!isTaskDetail(data)) {
    throw new Error("Unexpected task detail response from the API.");
  }

  return data;
}

export async function createTask(input: TaskWriteInput): Promise<Task> {
  const response = await fetch(getTasksApiUrl(""), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildTaskRequestBody(input)),
  });

  return parseTaskResponse(response, "Unable to create task");
}

export async function updateTask(
  id: string,
  input: TaskWriteInput,
): Promise<Task> {
  const response = await fetch(getTasksApiUrl(`/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildTaskRequestBody(input)),
  });

  return parseTaskResponse(response, "Unable to update task");
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(getTasksApiUrl(`/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Unable to delete task (${response.status}).`);
  }
}

async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
  validator: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok) {
    throw new TaskApiError(`${fallbackMessage} (${response.status}).`, response.status);
  }

  const data: unknown = await response.json();

  if (!validator(data)) {
    throw new Error(`Unexpected response while trying to ${fallbackMessage.toLowerCase()}.`);
  }

  return data;
}

export async function updateTaskDetail(
  id: string,
  input: TaskDetailUpdateInput,
): Promise<TaskDetail> {
  const response = await fetch(getTasksApiUrl(`/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJsonResponse(response, "Unable to update task", isTaskDetail);
}

export async function createSubtask(
  taskId: string,
  input: SubtaskWriteInput,
): Promise<Subtask> {
  const response = await fetch(getTasksApiUrl(`/${taskId}/subtasks`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJsonResponse(response, "Unable to create subtask", isSubtask);
}

export async function updateSubtask(
  taskId: string,
  subtaskId: string,
  input: Partial<SubtaskWriteInput>,
): Promise<Subtask> {
  const response = await fetch(getTasksApiUrl(`/${taskId}/subtasks/${subtaskId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJsonResponse(response, "Unable to update subtask", isSubtask);
}

export async function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  const response = await fetch(getTasksApiUrl(`/${taskId}/subtasks/${subtaskId}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new TaskApiError(`Unable to delete subtask (${response.status}).`, response.status);
  }
}

export async function createTaskComment(
  taskId: string,
  input: TaskCommentWriteInput,
): Promise<TaskComment> {
  const response = await fetch(getTasksApiUrl(`/${taskId}/comments`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJsonResponse(response, "Unable to add comment", isTaskComment);
}

export async function deleteTaskComment(taskId: string, commentId: string): Promise<void> {
  const response = await fetch(getTasksApiUrl(`/${taskId}/comments/${commentId}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new TaskApiError(`Unable to delete comment (${response.status}).`, response.status);
  }
}
