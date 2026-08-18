import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PROJECT_PRIORITIES } from '../project.types';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateProjectDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(PROJECT_PRIORITIES)
  priority?: (typeof PROJECT_PRIORITIES)[number];

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  leadName?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
