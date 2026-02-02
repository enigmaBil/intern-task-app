import { Notification } from '../domain/entities/notification.entity';

/**
 * Interface de l'interactor Notification
 * 
 * Cette interface définit le contrat que l'infrastructure doit implémenter.
 * Elle fait partie du Core (Domain Layer) et ne doit PAS dépendre de Prisma,
 * TypeORM ou tout autre framework de persistance.
 * 
 * C'est un PORT dans l'architecture hexagonale.
 */
export interface INotificationInteractor {
  /**
   * Récupère une notification par son ID
   * 
   * @param id - ID de la notification
   * @returns La notification si trouvée, null sinon
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Récupère les notifications d'un utilisateur
   * 
   * @param recipientId - ID du destinataire
   * @param limit - Nombre maximum de notifications à retourner (optionnel)
   * @param unreadOnly - Si true, retourne uniquement les non lues (optionnel)
   * @returns Liste des notifications
   */
  findByRecipient(
    recipientId: string, 
    limit?: number, 
    unreadOnly?: boolean
  ): Promise<Notification[]>;

  /**
   * Récupère le nombre de notifications non lues d'un utilisateur
   * 
   * @param recipientId - ID du destinataire
   * @returns Nombre de notifications non lues
   */
  countUnread(recipientId: string): Promise<number>;

  /**
   * Sauvegarde une notification (création ou mise à jour)
   * 
   * @param notification - Notification à sauvegarder
   * @returns La notification sauvegardée
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Marque une notification comme lue
   * 
   * @param id - ID de la notification
   * @returns La notification mise à jour, null si non trouvée
   */
  markAsRead(id: string): Promise<Notification | null>;

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * 
   * @param recipientId - ID du destinataire
   * @returns Nombre de notifications mises à jour
   */
  markAllAsRead(recipientId: string): Promise<number>;

  /**
   * Supprime une notification
   * 
   * @param id - ID de la notification à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Supprime les notifications expirées (plus de X jours)
   * 
   * @param retentionDays - Nombre de jours de rétention (défaut: 30)
   * @returns Nombre de notifications supprimées
   */
  deleteExpired(retentionDays?: number): Promise<number>;

  /**
   * Vérifie si une notification existe
   * 
   * @param id - ID de la notification
   * @returns true si la notification existe, false sinon
   */
  exists(id: string): Promise<boolean>;
}
