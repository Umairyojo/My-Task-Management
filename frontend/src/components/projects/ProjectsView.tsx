"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { Project, ProjectFormValues } from "./types";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type ProjectWriteInput,
} from "@/services/projects-api";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { ProjectRow } from "./ProjectRow";
import {
  ProjectsEmptyState,
  ProjectsErrorState,
  ProjectsLoadingState,
} from "./ProjectsStates";

type ProjectFormState =
  | { mode: "create" }
  | { mode: "edit"; project: Project };

function toProjectWriteInput(values: ProjectFormValues): ProjectWriteInput {
  return {
    name: values.name,
    priority: values.priority,
    leadName: values.leadName,
    dueDate: values.dueDate,
  };
}

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [formState, setFormState] = useState<ProjectFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const requestIdRef = useRef(0);

  const loadProjects = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus("loading");

    try {
      const nextProjects = await getProjects();

      if (requestId !== requestIdRef.current) {
        return;
      }

      setProjects(nextProjects);
      setStatus("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProjects]);

  const handleCreateProject = useCallback(() => {
    setFormState({ mode: "create" });
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setFormState({ mode: "edit", project });
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setDeleteTarget(project);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormState(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: ProjectFormValues) => {
      const input = toProjectWriteInput(values);

      if (formState?.mode === "edit") {
        const updatedProject = await updateProject(formState.project.id, input);
        setProjects((current) =>
          current.map((project) =>
            project.id === updatedProject.id ? updatedProject : project,
          ),
        );
      } else {
        const createdProject = await createProject(input);
        setProjects((current) => [...current, createdProject]);
      }
    },
    [formState],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteProject(deleteTarget.id);
    setProjects((current) =>
      current.filter((project) => project.id !== deleteTarget.id),
    );
  }, [deleteTarget]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-foreground">
          Projects
        </h1>

        <button
          type="button"
          onClick={handleCreateProject}
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-border bg-foreground px-3 text-[13px] font-medium text-background transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Project
        </button>
      </div>

      {status === "loading" ? (
        <ProjectsLoadingState />
      ) : status === "error" ? (
        <ProjectsErrorState
          message="Check that the backend is running, then try again."
          onRetry={() => void loadProjects()}
        />
      ) : projects.length === 0 ? (
        <ProjectsEmptyState onAction={handleCreateProject} />
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-border bg-background">
          <table className="min-w-full border-collapse">
            <thead className="bg-surface">
              <tr className="text-left text-[11px] font-medium text-muted">
                <th className="w-[36%] px-4 py-2 font-medium">Project</th>
                <th className="w-[18%] px-4 py-2 font-medium">Priority</th>
                <th className="w-[22%] px-4 py-2 font-medium">Lead</th>
                <th className="w-[18%] px-4 py-2 font-medium">Due Date</th>
                <th className="w-[6%] px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectFormDialog
        key={
          formState
            ? formState.mode === "edit"
              ? formState.project.id
              : "project-create"
            : "project-form-closed"
        }
        open={formState !== null}
        mode={formState?.mode ?? "create"}
        project={formState?.mode === "edit" ? formState.project : undefined}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <ProjectDeleteDialog
        key={deleteTarget?.id ?? "project-delete-closed"}
        open={deleteTarget !== null}
        projectName={deleteTarget?.name ?? ""}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
