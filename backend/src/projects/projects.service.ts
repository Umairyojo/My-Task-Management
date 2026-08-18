import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaTaskPriority } from '../tasks/task.mapper';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { toProjectDetailResponse, toProjectResponse } from './project.mapper';
import type { ProjectDetailResponse, ProjectResponse } from './project.types';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProjectResponse[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return projects.map(toProjectResponse);
  }

  async findOne(id: string): Promise<ProjectDetailResponse> {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" was not found.`);
    }

    return toProjectDetailResponse(project);
  }

  async create(dto: CreateProjectDto): Promise<ProjectResponse> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        priority: toPrismaTaskPriority(dto.priority),
        leadName: dto.leadName,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    return toProjectResponse(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectResponse> {
    await this.assertProjectExists(id);

    const project = await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        priority: dto.priority ? toPrismaTaskPriority(dto.priority) : undefined,
        leadName: dto.leadName,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    return toProjectResponse(project);
  }

  async remove(id: string): Promise<void> {
    await this.assertProjectExists(id);

    await this.prisma.project.delete({
      where: {
        id,
      },
    });
  }

  private async assertProjectExists(id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" was not found.`);
    }
  }
}
