import {
  Project as PrismaProject,
  Task as PrismaTask,
  TaskPriority as PrismaTaskPriority,
} from '../generated/prisma/client';
import { toTaskResponse } from '../tasks/task.mapper';
import type {
  ProjectDetailResponse,
  ProjectPriority,
  ProjectResponse,
} from './project.types';

const prismaTaskPriorityMap: Record<PrismaTaskPriority, ProjectPriority> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NO_PRIORITY: 'no-priority',
};

export function toProjectResponse(project: PrismaProject): ProjectResponse {
  return {
    id: project.id,
    name: project.name,
    priority: prismaTaskPriorityMap[project.priority],
    leadName: project.leadName,
    dueDate: project.dueDate ? project.dueDate.toISOString() : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function toProjectDetailResponse(
  project: PrismaProject & { tasks: PrismaTask[] },
): ProjectDetailResponse {
  return {
    ...toProjectResponse(project),
    tasks: project.tasks.map(toTaskResponse),
  };
}
