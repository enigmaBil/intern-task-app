import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@/core/domain/enums/notification-type.enum';
import { Notification, NotificationMetadata } from '@/core/domain/entities/notification.entity';

/**
 * DTO de réponse pour une notification
 */
export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID unique de la notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Type de notification',
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Titre de la notification',
    example: 'Nouvelle tâche assignée',
  })
  title: string;

  @ApiProperty({
    description: 'Message de la notification',
    example: 'John Doe vous a assigné la tâche "Créer la page login"',
  })
  message: string;

  @ApiProperty({
    description: 'ID du destinataire',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  recipientId: string;

  @ApiProperty({
    description: 'Indique si la notification a été lue',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Métadonnées de la notification',
    example: { taskId: '123', taskTitle: 'Ma tâche' },
    nullable: true,
  })
  metadata: NotificationMetadata | null;

  @ApiProperty({
    description: 'URL de redirection',
    example: '/tasks/123',
    nullable: true,
  })
  redirectUrl: string | null;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-01-30T10:30:00.000Z',
  })
  createdAt: string;

  /**
   * Convertit une entité Notification en DTO
   */
  static fromEntity(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.type = notification.type;
    dto.title = notification.title;
    dto.message = notification.message;
    dto.recipientId = notification.recipientId;
    dto.isRead = notification.isRead;
    dto.metadata = notification.metadata;
    dto.redirectUrl = notification.getRedirectUrl();
    dto.createdAt = notification.createdAt.toISOString();
    return dto;
  }

  /**
   * Convertit une liste d'entités en DTOs
   */
  static fromEntityList(notifications: Notification[]): NotificationResponseDto[] {
    return notifications.map(n => NotificationResponseDto.fromEntity(n));
  }
}

/**
 * DTO pour la liste des notifications avec count
 */
export class NotificationListResponseDto {
  @ApiProperty({
    description: 'Liste des notifications',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: 'Nombre de notifications non lues',
    example: 5,
  })
  unreadCount: number;
}
