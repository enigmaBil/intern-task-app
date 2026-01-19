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
 * DTO pour la création d'une tâche
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'Titre de la tâche',
    example: 'Implémenter le module d\'authentification',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Description détaillée de la tâche',
    example: 'Mettre en place Keycloak pour l\'authentification JWT avec synchronisation automatique des utilisateurs',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiPropertyOptional({
    description: 'Date limite pour terminer la tâche',
    example: '2026-01-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Deadline must be a valid ISO 8601 date string' })
  deadline?: string;
}

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

/**
 * DTO pour assigner une tâche à un utilisateur
 */
export class AssignTaskDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur à assigner à la tâche',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Assignee ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Assignee ID is required' })
  assigneeId: string;
}

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

/**
 * DTO de réponse pour une tâche
 * Représente la structure renvoyée par l'API
 */
export class TaskResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la tâche',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Titre de la tâche',
    example: 'Implémenter le module d\'authentification',
  })
  title: string;

  @ApiProperty({
    description: 'Description de la tâche',
    example: 'Mettre en place Keycloak pour l\'authentification JWT',
  })
  description: string;

  @ApiProperty({
    description: 'Statut actuel de la tâche',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  creatorId: string;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur assigné (null si non assigné)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    nullable: true,
  })
  assigneeId: string | null;

  @ApiPropertyOptional({
    description: 'Date limite (null si non définie)',
    example: '2026-01-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  deadline: Date | null;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-01-19T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2026-01-19T15:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
