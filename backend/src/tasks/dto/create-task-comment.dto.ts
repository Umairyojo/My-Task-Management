import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTaskCommentDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  authorEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  authorAvatar?: string;

  @IsOptional()
  @IsUUID('4')
  parentId?: string;
}
