"use client";

import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, CalendarDays, Edit3, Tag, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskListView } from "@/components/tasks/TaskListView";
import { defaultTaskFieldVisibility } from "@/components/tasks/task-fields";
import { PriorityIndicator } from "@/components/tasks/PriorityIndicator";
import { formatTaskDate } from "@/components/tasks/task-date";
import {
  getProject,
  updateProject,
  deleteProject,
  ProjectApiError,
  type ProjectWriteInput,
} from "@/services/projects-api";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import type { ProjectDetail, ProjectFormValues } from "./types";

function parseDate(value: string | null): string {
  return value ? formatTaskDate(value) ?? "-" : "-";
}

function toProjectWriteInput(values: ProjectFormValues): ProjectWriteInput {
  return {
    name: values.name,
    priority: values.priority,
    leadName: values.leadName,
    dueDate: values.dueDate,
  };
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-[12px] leading-5 text-foreground">{value}</div>
    </div>
  );
}

function ProjectDetailLoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-[10px] border border-border bg-background p-4">
        <div className="h-3.5 w-24 rounded-full bg-surface animate-pulse" />
        <div className="mt-3 h-8 w-72 max-w-full rounded-full bg-surface animate-pulse" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[74px] rounded-[10px] border border-border bg-surface/70 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-[132px] rounded-[10px] border border-border bg-surface/70 animate-pulse" />
        <div className="h-[132px] rounded-[10px] border border-border bg-surface/70 animate-pulse" />
      </div>
    </div>
  );
}

function ProjectDetailErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-background px-4 py-3.5">
      <p className="text-[12px] font-medium text-foreground">Unable to load project.</p>
      <p className="mt-1 text-[12px] leading-4 text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-8 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
      >
        Retry
      </button>
    </div>
  );
}

function ProjectDetailNotFoundState() {
  return (
    <div className="rounded-[10px] border border-border bg-background px-4 py-3.5">
      <p className="text-[12px] font-medium text-foreground">Project not found.</p>
      <p className="mt-1 text-[12px] leading-4 text-muted">
        The requested project may have been deleted or the link is invalid.
      </p>
      <Link
        href="/projects"
        className="mt-4 inline-flex h-8 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
      >
        Back to Projects
      </Link>
    </div>
  );
}

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "not-found">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("Unable to load project.");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const requestIdRef = useRef(0);

  const loadProject = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus("loading");

    try {
      const nextProject = await getProject(projectId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setProject(nextProject);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof ProjectApiError && error.status === 404) {
        setProject(null);
        setStatus("not-found");
        return;
      }

      setProject(null);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load project.");
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProject();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProject]);

  const leadName = useMemo(() => project?.leadName?.trim() || "-", [project]);
  const dueDate = useMemo(() => parseDate(project?.dueDate ?? null), [project]);
  const tasks = project?.tasks ?? [];

  const handleSubmit = useCallback(
    async (values: ProjectFormValues) => {
      if (!project) {
        return;
      }

      const updatedProject = await updateProject(project.id, toProjectWriteInput(values));
      setProject((current) => (current ? { ...current, ...updatedProject } : current));
    },
    [project],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!project) {
      return;
    }

    await deleteProject(project.id);
    router.push("/projects");
  }, [project, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
        </div>
        <ProjectDetailLoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
        </div>
        <ProjectDetailErrorState message={errorMessage} onRetry={() => void loadProject()} />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
        </div>
        <ProjectDetailNotFoundState />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Projects
        </Link>

        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface sm:h-8"
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            Edit Project
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex h-9 items-center rounded-[4px] border border-border bg-background px-3 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 sm:h-8"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-[10px] border border-border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                Project Detail
              </p>
              <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                {project.name}
              </h1>
            </div>

            <PriorityIndicator priority={project.priority} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailCard
              icon={<Tag className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Priority"
              value={<PriorityIndicator priority={project.priority} />}
            />
            <DetailCard
              icon={<Users className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Lead"
              value={leadName}
            />
            <DetailCard
              icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Due Date"
              value={dueDate}
            />
            <DetailCard
              icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Updated"
              value={formatTaskDate(project.updatedAt)}
            />
          </div>

          <div className="mt-4 rounded-[10px] border border-border bg-surface px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Created
            </p>
            <p className="mt-2 text-[13px] leading-5 text-foreground">
              {formatTaskDate(project.createdAt)}
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[10px] border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Tasks
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted">
              Tasks assigned to this project.
            </p>
          </section>
        </aside>
      </div>

      {tasks.length > 0 ? (
        <TaskListView
          tasks={tasks}
          onAddTask={() => undefined}
          onEditTask={() => undefined}
          onDeleteTask={() => undefined}
          hideEmptySections
          fieldVisibility={defaultTaskFieldVisibility}
          showAddTask={false}
          showActions={false}
        />
      ) : (
        <div className="rounded-[10px] border border-border bg-surface px-4 py-3 text-[13px] text-muted">
          No tasks assigned to this project yet.
        </div>
      )}

      <ProjectFormDialog
        key={isEditOpen ? project.id : "project-detail-edit-closed"}
        open={isEditOpen}
        mode="edit"
        project={project}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSubmit}
      />

      <ProjectDeleteDialog
        key={isDeleteOpen ? project.id : "project-detail-delete-closed"}
        open={isDeleteOpen}
        projectName={project.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
