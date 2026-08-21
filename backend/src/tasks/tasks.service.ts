import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  SubtaskResponse,
  TaskActivityResponse,
  TaskCommentResponse,
  TaskDetailResponse,
  TaskResponse,
} from './task.types';
import {
  toPrismaTaskPriority,
  toPrismaTaskStatus,
  toSubtaskResponse,
  toTaskActivityResponse,
  toTaskCommentResponse,
  toTaskResponse,
} from './task.mapper';

interface ActivityInput {
  type: string;
  message: string;
}

const taskDetailInclude = {
  subtasks: { orderBy: { createdAt: 'asc' } },
  comments: { orderBy: { createdAt: 'asc' } },
  activities: { orderBy: { createdAt: 'desc' } },
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return tasks.map(toTaskResponse);
  }

  async findOne(id: string): Promise<TaskDetailResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskDetailInclude,
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }

    return {
      ...toTaskResponse(task),
      subtasks: task.subtasks.map(toSubtaskResponse),
      comments: task.comments.map(toTaskCommentResponse),
      activities: task.activities.map(toTaskActivityResponse),
    };
  }

  async create(dto: CreateTaskDto): Promise<TaskResponse> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        status: toPrismaTaskStatus(dto.status),
        priority: toPrismaTaskPriority(dto.priority),
        description: dto.description || null,
        assigneeName: dto.assigneeName || null,
        assigneeInitials: dto.assigneeInitials || null,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels ?? [],
        teams: dto.teams ?? [],
        resources: dto.resources ?? [],
        reporterName: dto.reporterName || dto.actorName || null,
        reporterAvatar: dto.reporterAvatar || dto.actorAvatar || null,
      },
    });

    return toTaskResponse(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDetailResponse> {
    const currentTask = await this.getTaskOrThrow(id);
    const currentResponse = toTaskResponse(currentTask);
    const activities: ActivityInput[] = [];

    if (dto.status && dto.status !== currentResponse.status) {
      activities.push({
        type: 'status-changed',
        message: `changed status from ${this.labelStatus(currentResponse.status)} to ${this.labelStatus(dto.status)}`,
      });
    }

    if (dto.priority && dto.priority !== currentResponse.priority) {
      activities.push({
        type: 'priority-changed',
        message: `changed priority from ${this.labelPriority(currentResponse.priority)} to ${this.labelPriority(dto.priority)}`,
      });
    }

    if (
      dto.assigneeName !== undefined &&
      dto.assigneeName !== currentTask.assigneeName
    ) {
      activities.push({
        type: 'assignee-changed',
        message: dto.assigneeName
          ? `assigned ${dto.assigneeName} to this task`
          : 'removed the task assignee',
      });
    }

    if (
      dto.startDate &&
      this.isDifferentDate(currentTask.startDate, dto.startDate)
    ) {
      activities.push({
        type: 'start-date-changed',
        message: 'changed the start date',
      });
    }

    if (dto.dueDate && this.isDifferentDate(currentTask.dueDate, dto.dueDate)) {
      activities.push({
        type: 'due-date-changed',
        message: 'changed the due date',
      });
    }

    await this.prisma.task.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        status: dto.status ? toPrismaTaskStatus(dto.status) : undefined,
        priority: dto.priority ? toPrismaTaskPriority(dto.priority) : undefined,
        description: dto.description,
        assigneeName: dto.assigneeName,
        assigneeInitials: dto.assigneeInitials,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels,
        teams: dto.teams,
        resources: dto.resources,
        reporterName: dto.reporterName,
        reporterAvatar: dto.reporterAvatar,
      },
    });

    await this.createActivities(id, dto.actorName, dto.actorAvatar, activities);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.assertTaskExists(id);

    await this.prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async createSubtask(
    id: string,
    dto: CreateSubtaskDto,
  ): Promise<SubtaskResponse> {
    await this.assertTaskExists(id);
    const subtask = await this.prisma.subtask.create({
      data: {
        taskId: id,
        title: dto.title,
        priority: dto.priority ? toPrismaTaskPriority(dto.priority) : undefined,
        assigneeName: dto.assigneeName || null,
        assigneeInitials: dto.assigneeInitials || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    await this.createActivities(id, dto.actorName, dto.actorAvatar, [
      {
        type: 'subtask-created',
        message: `created subtask "${subtask.title}"`,
      },
    ]);

    return toSubtaskResponse(subtask);
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
  ): Promise<SubtaskResponse> {
    const subtask = await this.getSubtaskOrThrow(taskId, subtaskId);
    const updatedSubtask = await this.prisma.subtask.update({
      where: { id: subtask.id },
      data: {
        title: dto.title,
        priority: dto.priority ? toPrismaTaskPriority(dto.priority) : undefined,
        assigneeName: dto.assigneeName,
        assigneeInitials: dto.assigneeInitials,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    await this.createActivities(taskId, dto.actorName, dto.actorAvatar, [
      {
        type: 'subtask-updated',
        message: `updated subtask "${updatedSubtask.title}"`,
      },
    ]);

    return toSubtaskResponse(updatedSubtask);
  }

  async removeSubtask(taskId: string, subtaskId: string): Promise<void> {
    const subtask = await this.getSubtaskOrThrow(taskId, subtaskId);
    await this.prisma.subtask.delete({ where: { id: subtask.id } });
    await this.createActivities(taskId, undefined, undefined, [
      {
        type: 'subtask-deleted',
        message: `deleted subtask "${subtask.title}"`,
      },
    ]);
  }

  async createComment(
    taskId: string,
    dto: CreateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    await this.assertTaskExists(taskId);

    if (dto.parentId) {
      await this.getCommentOrThrow(taskId, dto.parentId);
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        parentId: dto.parentId,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        authorAvatar: dto.authorAvatar || null,
        body: dto.body,
      },
    });

    await this.createActivities(taskId, dto.authorName, dto.authorAvatar, [
      { type: 'comment-added', message: 'added a comment' },
    ]);

    return toTaskCommentResponse(comment);
  }

  async removeComment(taskId: string, commentId: string): Promise<void> {
    await this.getCommentOrThrow(taskId, commentId);
    await this.prisma.taskComment.delete({ where: { id: commentId } });
  }

  async findActivities(taskId: string): Promise<TaskActivityResponse[]> {
    await this.assertTaskExists(taskId);
    const activities = await this.prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
    return activities.map(toTaskActivityResponse);
  }

  private async createActivities(
    taskId: string,
    actorName: string | undefined,
    actorAvatar: string | undefined,
    activities: ActivityInput[],
  ): Promise<void> {
    if (activities.length === 0) {
      return;
    }

    const actor = actorName?.trim() || 'Workspace user';
    await this.prisma.taskActivity.createMany({
      data: activities.map((activity) => ({
        taskId,
        actorName: actor,
        actorAvatar: actorAvatar || null,
        type: activity.type,
        message: activity.message,
      })),
    });
  }

  private async getTaskOrThrow(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }
    return task;
  }

  private async getSubtaskOrThrow(taskId: string, subtaskId: string) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });
    if (!subtask) {
      throw new NotFoundException(
        `Subtask with id "${subtaskId}" was not found.`,
      );
    }
    return subtask;
  }

  private async getCommentOrThrow(taskId: string, commentId: string) {
    const comment = await this.prisma.taskComment.findFirst({
      where: { id: commentId, taskId },
    });
    if (!comment) {
      throw new NotFoundException(
        `Comment with id "${commentId}" was not found.`,
      );
    }
    return comment;
  }

  private isDifferentDate(current: Date | null, next: string): boolean {
    return current?.toISOString().slice(0, 10) !== next.slice(0, 10);
  }

  private labelStatus(value: string): string {
    return (
      {
        todo: 'To Do',
        doing: 'Doing',
        completed: 'Completed',
        'on-hold': 'On Hold',
        backlog: 'Backlog',
      }[value] ?? value
    );
  }

  private labelPriority(value: string): string {
    return (
      {
        urgent: 'Urgent',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        'no-priority': 'No Priority',
      }[value] ?? value
    );
  }

  private async assertTaskExists(id: string): Promise<void> {
    await this.getTaskOrThrow(id);
  }
}
