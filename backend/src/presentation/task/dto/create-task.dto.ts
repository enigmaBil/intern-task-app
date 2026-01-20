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