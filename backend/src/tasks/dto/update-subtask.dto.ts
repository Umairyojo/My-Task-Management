import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TASK_PRIORITIES } from '../task.types';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateSubtaskDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

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
