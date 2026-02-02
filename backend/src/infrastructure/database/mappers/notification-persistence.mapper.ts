import { Notification, NotificationMetadata } from "@/core/domain/entities/notification.entity";
import { NotificationType } from "@/core/domain/enums/notification-type.enum";
import { Prisma, Notification as PrismaNotification, NotificationType as PrismaNotificationType } from "@prisma/client";

/**
 * Mapper pour convertir entre l'entité Notification (Domain)
 * et le modèle Prisma Notification (Infrastructure)
 * 
 * Ce mapper fait le pont entre notre domaine métier 
 * et la couche de persistance des données.
 */
export class NotificationPersistenceMapper {
  /**
   * Convertit un modèle Prisma Notification vers une entité Domain Notification
   * 
   * @param prismaNotification - Modèle Prisma récupéré de la DB
   * @returns Entité Notification du domain
   */
  static toDomain(prismaNotification: PrismaNotification): Notification {
    return Notification.reconstitute({
      id: prismaNotification.id,
      type: prismaNotification.type as unknown as NotificationType,
      title: prismaNotification.title,
      message: prismaNotification.message,
      recipientId: prismaNotification.recipientId,
      isRead: prismaNotification.isRead,
      metadata: prismaNotification.metadata as NotificationMetadata | null,
      createdAt: prismaNotification.createdAt,
    });
  }

  /**
   * Convertit une liste de modèles Prisma vers des entités Domain
   * 
   * @param prismaNotifications - Liste de modèles Prisma
   * @returns Liste d'entités Notification du domain
   */
  static toDomainList(prismaNotifications: PrismaNotification[]): Notification[] {
    return prismaNotifications.map((notification) => this.toDomain(notification));
  }

  /**
   * Convertit une entité Notification vers un objet Prisma.NotificationCreateInput
   * Utilisé pour les opérations de création
   * 
   * @param notification - Entité Notification du domain
   * @returns Objet Prisma pour la création
   */
  static toPrismaCreate(notification: Notification): Prisma.NotificationCreateInput {
    return {
      id: notification.id,
      type: notification.type as unknown as PrismaNotificationType,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      metadata: notification.metadata as Prisma.InputJsonValue,
      recipient: {
        connect: { id: notification.recipientId },
      },
      createdAt: notification.createdAt,
    };
  }

  /**
   * Convertit une entité Notification vers un objet Prisma.NotificationUpdateInput
   * Utilisé pour les opérations de mise à jour
   * 
   * @param notification - Entité Notification du domain
   * @returns Objet Prisma pour la mise à jour
   */
  static toPrismaUpdate(notification: Notification): Prisma.NotificationUpdateInput {
    return {
      isRead: notification.isRead,
    };
  }

  /**
   * Convertit le type de notification domain vers Prisma
   */
  static typeToPrisma(type: NotificationType): PrismaNotificationType {
    return type as unknown as PrismaNotificationType;
  }

  /**
   * Convertit le type de notification Prisma vers domain
   */
  static typeToDomain(type: PrismaNotificationType): NotificationType {
    return type as unknown as NotificationType;
  }
}
