import { TASK_PRIORITIES, type TaskPriority } from '../tasks/task.types';
import type { TaskResponse } from '../tasks/task.types';

export const PROJECT_PRIORITIES = TASK_PRIORITIES;

export type ProjectPriority = TaskPriority;

export interface ProjectResponse {
  id: string;
  name: string;
  priority: ProjectPriority;
  leadName: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetailResponse extends ProjectResponse {
  tasks: TaskResponse[];
}
