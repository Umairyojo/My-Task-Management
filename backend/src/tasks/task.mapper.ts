import {
  Task as PrismaTask,
  Subtask as PrismaSubtask,
  TaskActivity as PrismaTaskActivity,
  TaskComment as PrismaTaskComment,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
} from '../generated/prisma/client';
import {
  SubtaskResponse,
  TaskActivityResponse,
  TaskCommentResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus,
} from './task.types';

const taskStatusMap = {
  todo: PrismaTaskStatus.TODO,
  doing: PrismaTaskStatus.DOING,
  completed: PrismaTaskStatus.COMPLETED,
  'on-hold': PrismaTaskStatus.ON_HOLD,
  backlog: PrismaTaskStatus.BACKLOG,
} as const satisfies Record<TaskStatus, PrismaTaskStatus>;

const taskPriorityMap = {
  urgent: PrismaTaskPriority.URGENT,
  high: PrismaTaskPriority.HIGH,
  medium: PrismaTaskPriority.MEDIUM,
  low: PrismaTaskPriority.LOW,
  'no-priority': PrismaTaskPriority.NO_PRIORITY,
} as const satisfies Record<TaskPriority, PrismaTaskPriority>;

const prismaTaskStatusMap: Record<PrismaTaskStatus, TaskStatus> = {
  TODO: 'todo',
  DOING: 'doing',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  BACKLOG: 'backlog',
};

const prismaTaskPriorityMap: Record<PrismaTaskPriority, TaskPriority> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NO_PRIORITY: 'no-priority',
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
    description: task.description,
    assigneeName: task.assigneeName,
    assigneeInitials: task.assigneeInitials,
    startDate: task.startDate ? task.startDate.toISOString() : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    labels: task.labels,
    teams: task.teams,
    resources: task.resources,
    reporterName: task.reporterName,
    reporterAvatar: task.reporterAvatar,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function toSubtaskResponse(subtask: PrismaSubtask): SubtaskResponse {
  return {
    id: subtask.id,
    taskId: subtask.taskId,
    title: subtask.title,
    priority: prismaTaskPriorityMap[subtask.priority],
    assigneeName: subtask.assigneeName,
    assigneeInitials: subtask.assigneeInitials,
    dueDate: subtask.dueDate ? subtask.dueDate.toISOString() : null,
    createdAt: subtask.createdAt.toISOString(),
    updatedAt: subtask.updatedAt.toISOString(),
  };
}

export function toTaskCommentResponse(
  comment: PrismaTaskComment,
): TaskCommentResponse {
  return {
    id: comment.id,
    taskId: comment.taskId,
    parentId: comment.parentId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    authorAvatar: comment.authorAvatar,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export function toTaskActivityResponse(
  activity: PrismaTaskActivity,
): TaskActivityResponse {
  return {
    id: activity.id,
    taskId: activity.taskId,
    actorName: activity.actorName,
    actorAvatar: activity.actorAvatar,
    type: activity.type,
    message: activity.message,
    createdAt: activity.createdAt.toISOString(),
  };
}
