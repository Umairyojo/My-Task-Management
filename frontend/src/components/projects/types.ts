import type { Task, TaskPriority } from "@/components/tasks/types";

export interface Project {
  id: string;
  name: string;
  priority: TaskPriority;
  leadName: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface ProjectFormValues {
  name: string;
  priority: TaskPriority;
  leadName: string;
  dueDate: string;
}
