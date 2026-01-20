import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '@/core/domain/enums/task-status.enum';

/**
 * DTO pour changer le statut d'une tâche
 */
export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la tâche',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TaskStatus;
}