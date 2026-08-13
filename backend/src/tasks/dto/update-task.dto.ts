import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { TASK_PRIORITIES, TASK_STATUSES } from '../task.types';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateTaskDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: (typeof TASK_STATUSES)[number];

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: (typeof TASK_PRIORITIES)[number];

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assigneeName?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(12)
  assigneeInitials?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}
