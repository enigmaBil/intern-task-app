import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@/core/domain/enums/task-status.enum';

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
