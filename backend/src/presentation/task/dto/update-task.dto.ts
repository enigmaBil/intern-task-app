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
 * DTO pour la mise à jour d'une tâche
 * Tous les champs sont optionnels (PATCH partiel)
 */
export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Titre de la tâche',
    example: 'Implémenter le module d\'authentification',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la tâche',
    example: 'Mettre en place Keycloak avec JWT',
  })
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Statut de la tâche',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Date limite pour terminer la tâche',
    example: '2026-01-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Deadline must be a valid ISO 8601 date string' })
  deadline?: string;
}