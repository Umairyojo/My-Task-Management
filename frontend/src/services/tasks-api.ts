import type { Task } from "@/components/tasks/types";

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Add it to frontend/.env.local.",
    );
  }

  return baseUrl;
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

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(new URL("/tasks", getApiBaseUrl()).toString(), {
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
