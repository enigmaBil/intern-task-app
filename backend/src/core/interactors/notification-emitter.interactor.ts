import { Notification } from '@/core/domain/entities/notification.entity';

/**
 * Interface pour l'émetteur d'événements de notification
 * 
 * Permet d'émettre des notifications en temps réel vers les clients connectés.
 * C'est un PORT dans l'architecture hexagonale.
 */
export interface INotificationEmitter {
  /**
   * Émet une notification vers un utilisateur spécifique
   * 
   * @param userId - ID de l'utilisateur destinataire
   * @param notification - Notification à émettre
   */
  emit(userId: string, notification: Notification): void;

  /**
   * Émet une notification vers plusieurs utilisateurs
   * 
   * @param userIds - IDs des utilisateurs destinataires
   * @param notification - Notification à émettre
   */
  emitToMany(userIds: string[], notification: Notification): void;
}
