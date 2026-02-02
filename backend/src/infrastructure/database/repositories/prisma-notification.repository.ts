import { INotificationInteractor } from "@/core/interactors";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { Notification } from "@/core/domain/entities/notification.entity";
import { NotificationPersistenceMapper } from "../mappers";

/**
 * Implémentation Prisma du repository Notification
 * 
 * Cette classe implémente l'interface INotificationInteractor définie dans le Core
 * et utilise Prisma pour la persistance des données
 */
@Injectable()
export class PrismaNotificationRepository implements INotificationInteractor {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère une notification par son ID
   */
  async findById(id: string): Promise<Notification | null> {
    const prismaNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!prismaNotification) {
      return null;
    }

    return NotificationPersistenceMapper.toDomain(prismaNotification);
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  async findByRecipient(
    recipientId: string,
    limit?: number,
    unreadOnly?: boolean,
  ): Promise<Notification[]> {
    const prismaNotifications = await this.prisma.notification.findMany({
      where: {
        recipientId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit ? { take: limit } : {}),
    });

    return NotificationPersistenceMapper.toDomainList(prismaNotifications);
  }

  /**
   * Récupère le nombre de notifications non lues d'un utilisateur
   */
  async countUnread(recipientId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });
  }

  /**
   * Sauvegarde une notification (création ou mise à jour)
   */
  async save(notification: Notification): Promise<Notification> {
    const exists = await this.exists(notification.id);

    if (exists) {
      // Mise à jour
      const updated = await this.prisma.notification.update({
        where: { id: notification.id },
        data: NotificationPersistenceMapper.toPrismaUpdate(notification),
      });
      return NotificationPersistenceMapper.toDomain(updated);
    } else {
      // Création
      const created = await this.prisma.notification.create({
        data: NotificationPersistenceMapper.toPrismaCreate(notification),
      });
      return NotificationPersistenceMapper.toDomain(created);
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string): Promise<Notification | null> {
    try {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NotificationPersistenceMapper.toDomain(updated);
    } catch {
      return null;
    }
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return result.count;
  }

  /**
   * Supprime une notification
   */
  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Supprime les notifications expirées (plus de X jours)
   */
  async deleteExpired(retentionDays: number = 30): Promise<number> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - retentionDays);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: expirationDate,
        },
      },
    });
    return result.count;
  }

  /**
   * Vérifie si une notification existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.notification.count({
      where: { id },
    });
    return count > 0;
  }
}
