import type {
  Project,
  ProjectDetail,
} from "@/components/projects/types";
import type { TaskPriority } from "@/components/tasks/types";

export interface ProjectWriteInput {
  name: string;
  priority: TaskPriority;
  leadName: string;
  dueDate: string;
}

export class ProjectApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProjectApiError";
    this.status = status;
  }
}

function getProjectsApiUrl(path: string): string {
  return `/api/projects${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProject(value: unknown): value is Project {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.priority === "urgent" ||
      value.priority === "high" ||
      value.priority === "medium" ||
      value.priority === "low" ||
      value.priority === "no-priority") &&
    (value.leadName === null || typeof value.leadName === "string") &&
    (value.dueDate === null || typeof value.dueDate === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isProjectDetail(value: unknown): value is ProjectDetail {
  return (
    isProject(value) &&
    isRecord(value) &&
    Array.isArray(value.tasks)
  );
}

async function parseProjectResponse(
  response: Response,
  fallbackMessage: string,
): Promise<Project> {
  if (!response.ok) {
    throw new ProjectApiError(`${fallbackMessage} (${response.status}).`, response.status);
  }

  const data: unknown = await response.json();

  if (!isProject(data)) {
    throw new Error("Unexpected project response from the API.");
  }

  return data;
}

async function parseProjectDetailResponse(
  response: Response,
  fallbackMessage: string,
): Promise<ProjectDetail> {
  if (!response.ok) {
    throw new ProjectApiError(`${fallbackMessage} (${response.status}).`, response.status);
  }

  const data: unknown = await response.json();

  if (!isProjectDetail(data)) {
    throw new Error("Unexpected project response from the API.");
  }

  return data;
}

function buildProjectRequestBody(input: ProjectWriteInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
    priority: input.priority,
  };

  const leadName = input.leadName.trim();
  const dueDate = input.dueDate.trim();

  if (leadName.length > 0) {
    body.leadName = leadName;
  }

  if (dueDate.length > 0) {
    body.dueDate = dueDate;
  }

  return body;
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(getProjectsApiUrl(""), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load projects (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || !data.every(isProject)) {
    throw new Error("Unexpected projects response from the API.");
  }

  return data;
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const response = await fetch(getProjectsApiUrl(`/${id}`), {
    cache: "no-store",
  });

  return parseProjectDetailResponse(response, "Unable to load project");
}

export async function createProject(
  input: ProjectWriteInput,
): Promise<Project> {
  const response = await fetch(getProjectsApiUrl(""), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildProjectRequestBody(input)),
  });

  return parseProjectResponse(response, "Unable to create project");
}

export async function updateProject(
  id: string,
  input: ProjectWriteInput,
): Promise<Project> {
  const response = await fetch(getProjectsApiUrl(`/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildProjectRequestBody(input)),
  });

  return parseProjectResponse(response, "Unable to update project");
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(getProjectsApiUrl(`/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Unable to delete project (${response.status}).`);
  }
}
