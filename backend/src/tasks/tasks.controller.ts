import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { TasksService } from './tasks.service';
import {
  SubtaskResponse,
  TaskActivityResponse,
  TaskCommentResponse,
  TaskDetailResponse,
  TaskResponse,
} from './task.types';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Promise<TaskResponse[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<TaskDetailResponse> {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskDetailResponse> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Post(':id/subtasks')
  @HttpCode(HttpStatus.CREATED)
  createSubtask(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ): Promise<SubtaskResponse> {
    return this.tasksService.createSubtask(id, createSubtaskDto);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('subtaskId', new ParseUUIDPipe({ version: '4' })) subtaskId: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<SubtaskResponse> {
    return this.tasksService.updateSubtask(id, subtaskId, updateSubtaskDto);
  }

  @Delete(':id/subtasks/:subtaskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSubtask(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('subtaskId', new ParseUUIDPipe({ version: '4' })) subtaskId: string,
  ): Promise<void> {
    await this.tasksService.removeSubtask(id, subtaskId);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createTaskCommentDto: CreateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    return this.tasksService.createComment(id, createTaskCommentDto);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeComment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('commentId', new ParseUUIDPipe({ version: '4' })) commentId: string,
  ): Promise<void> {
    await this.tasksService.removeComment(id, commentId);
  }

  @Get(':id/activities')
  findActivities(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<TaskActivityResponse[]> {
    return this.tasksService.findActivities(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.tasksService.remove(id);
  }
}
