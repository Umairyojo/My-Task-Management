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

export class CreateTaskDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsIn(TASK_STATUSES)
  status!: (typeof TASK_STATUSES)[number];

  @IsIn(TASK_PRIORITIES)
  priority!: (typeof TASK_PRIORITIES)[number];

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

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
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reporterName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  reporterAvatar?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  actorAvatar?: string;
}
