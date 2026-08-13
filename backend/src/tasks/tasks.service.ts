import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponse } from './task.types';
import {
  toPrismaTaskPriority,
  toPrismaTaskStatus,
  toTaskResponse,
} from './task.mapper';

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

  async findOne(id: string): Promise<TaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }

    return toTaskResponse(task);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponse> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        status: toPrismaTaskStatus(dto.status),
        priority: toPrismaTaskPriority(dto.priority),
        assigneeName: dto.assigneeName,
        assigneeInitials: dto.assigneeInitials,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels ?? [],
      },
    });

    return toTaskResponse(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponse> {
    await this.assertTaskExists(id);

    const task = await this.prisma.task.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        status: dto.status ? toPrismaTaskStatus(dto.status) : undefined,
        priority: dto.priority ? toPrismaTaskPriority(dto.priority) : undefined,
        assigneeName: dto.assigneeName,
        assigneeInitials: dto.assigneeInitials,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels,
      },
    });

    return toTaskResponse(task);
  }

  async remove(id: string): Promise<void> {
    await this.assertTaskExists(id);

    await this.prisma.task.delete({
      where: {
        id,
      },
    });
  }

  private async assertTaskExists(id: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" was not found.`);
    }
  }
}
