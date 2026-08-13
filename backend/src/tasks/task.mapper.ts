import {
  Task as PrismaTask,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
} from '../generated/prisma/client';
import { TaskPriority, TaskResponse, TaskStatus } from './task.types';

const taskStatusMap = {
  todo: PrismaTaskStatus.TODO,
  doing: PrismaTaskStatus.DOING,
  completed: PrismaTaskStatus.COMPLETED,
  'on-hold': PrismaTaskStatus.ON_HOLD,
} as const satisfies Record<TaskStatus, PrismaTaskStatus>;

const taskPriorityMap = {
  high: PrismaTaskPriority.HIGH,
  medium: PrismaTaskPriority.MEDIUM,
  low: PrismaTaskPriority.LOW,
} as const satisfies Record<TaskPriority, PrismaTaskPriority>;

const prismaTaskStatusMap: Record<PrismaTaskStatus, TaskStatus> = {
  TODO: 'todo',
  DOING: 'doing',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
};

const prismaTaskPriorityMap: Record<PrismaTaskPriority, TaskPriority> = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export function toPrismaTaskStatus(status: TaskStatus): PrismaTaskStatus {
  return taskStatusMap[status];
}

export function toPrismaTaskPriority(
  priority: TaskPriority,
): PrismaTaskPriority {
  return taskPriorityMap[priority];
}

export function toTaskResponse(task: PrismaTask): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    status: prismaTaskStatusMap[task.status],
    priority: prismaTaskPriorityMap[task.priority],
    assigneeName: task.assigneeName,
    assigneeInitials: task.assigneeInitials,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    labels: task.labels,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
