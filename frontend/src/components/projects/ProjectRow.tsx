"use client";

import Link from "next/link";
import type { Project } from "./types";
import { PriorityIndicator } from "@/components/tasks/PriorityIndicator";
import { formatTaskDate } from "@/components/tasks/task-date";
import { ProjectActionsMenu } from "./ProjectActionsMenu";

interface ProjectRowProps {
  project: Project;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function ProjectRow({
  project,
  onEditProject,
  onDeleteProject,
}: ProjectRowProps) {
  const dueDate = formatTaskDate(project.dueDate);

  return (
    <tr className="border-t border-border first:border-t-0 hover:bg-surface/40">
      <td className="px-4 py-2 align-middle">
        <Link
          href={`/projects/${project.id}`}
          className="block truncate text-[12px] font-medium leading-4 text-foreground transition-colors hover:text-muted"
        >
          {project.name}
        </Link>
      </td>
      <td className="px-4 py-2 align-middle">
        <PriorityIndicator priority={project.priority} />
      </td>
      <td className="px-4 py-2 align-middle">
        <span className="block truncate text-[12px] leading-4 text-muted">
          {project.leadName ?? "-"}
        </span>
      </td>
      <td className="px-4 py-2 align-middle whitespace-nowrap">
        <span className="text-[12px] leading-4 text-muted">
          {dueDate ?? "-"}
        </span>
      </td>
      <td className="px-4 py-2 align-middle text-right">
        <div className="flex justify-end">
          <ProjectActionsMenu
            projectName={project.name}
            onEdit={() => onEditProject(project)}
            onDelete={() => onDeleteProject(project)}
          />
        </div>
      </td>
    </tr>
  );
}
