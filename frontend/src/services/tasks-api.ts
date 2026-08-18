import type { Task, TaskPriority, TaskStatus } from "@/components/tasks/types";

export interface TaskWriteInput {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  assigneeInitials: string;
  dueDate: string;
  labels: string[];
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
      value.status === "on-hold") &&
    (value.priority === "high" ||
      value.priority === "medium" ||
      value.priority === "low") &&
    (value.assigneeName === null || typeof value.assigneeName === "string") &&
    (value.assigneeInitials === null ||
      typeof value.assigneeInitials === "string") &&
    (value.dueDate === null || typeof value.dueDate === "string") &&
    Array.isArray(value.labels) &&
    value.labels.every((label) => typeof label === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

async function parseTaskResponse(
  response: Response,
  fallbackMessage: string,
): Promise<Task> {
  if (!response.ok) {
    throw new Error(`${fallbackMessage} (${response.status}).`);
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
