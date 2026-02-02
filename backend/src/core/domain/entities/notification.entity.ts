import { NotificationType, getNotificationTitle } from '../enums/notification-type.enum';

/**
 * Métadonnées associées à une notification
 * Contient les informations contextuelles selon le type
 */
export interface NotificationMetadata {
  /** ID de la tâche concernée (pour TASK_ASSIGNED et TASK_STATUS_UPDATED) */
  taskId?: string;
  /** Titre de la tâche */
  taskTitle?: string;
  /** Nouveau statut de la tâche (pour TASK_STATUS_UPDATED) */
  newStatus?: string;
  /** Ancien statut de la tâche (pour TASK_STATUS_UPDATED) */
  oldStatus?: string;
  /** ID de la scrum note (pour SCRUM_NOTE_CREATED) */
  scrumNoteId?: string;
  /** Nom de l'utilisateur qui a déclenché l'action */
  actorName?: string;
  /** ID de l'utilisateur qui a déclenché l'action */
  actorId?: string;
}

/**
 * Interface pour créer une nouvelle notification
 */
export interface CreateNotificationData {
  type: NotificationType;
  recipientId: string;
  message: string;
  title?: string;
  metadata?: NotificationMetadata;
}

/**
 * Entity Notification - Représente une notification dans le système
 * 
 * Contient toute la logique métier liée aux notifications.
 * Cette classe est indépendante de tout framework.
 */
export class Notification {
  private constructor(
    public readonly id: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly recipientId: string,
    public isRead: boolean,
    public readonly metadata: NotificationMetadata | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factory method pour créer une nouvelle notification
   * 
   * @param data - Données nécessaires pour créer une notification
   * @returns Une nouvelle instance de Notification
   * @throws Error si les données sont invalides
   */
  static create(data: CreateNotificationData): Notification {
    // Validation métier
    if (!data.recipientId) {
      throw new Error('Recipient ID is required');
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Notification message cannot be empty');
    }

    if (data.message.length > 500) {
      throw new Error('Notification message cannot exceed 500 characters');
    }

    const title = data.title || getNotificationTitle(data.type);

    return new Notification(
      crypto.randomUUID(),
      data.type,
      title,
      data.message.trim(),
      data.recipientId,
      false, // Non lue par défaut
      data.metadata || null,
      new Date(),
    );
  }

  /**
   * Reconstruit une notification depuis la base de données
   * 
   * @param data - Toutes les propriétés d'une notification existante
   * @returns Instance de Notification
   */
  static reconstitute(data: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    recipientId: string;
    isRead: boolean;
    metadata: NotificationMetadata | null;
    createdAt: Date;
  }): Notification {
    return new Notification(
      data.id,
      data.type,
      data.title,
      data.message,
      data.recipientId,
      data.isRead,
      data.metadata,
      data.createdAt,
    );
  }

  /**
   * Marque la notification comme lue
   */
  markAsRead(): void {
    this.isRead = true;
  }

  /**
   * Vérifie si la notification est expirée (plus de 30 jours)
   * 
   * @param retentionDays - Nombre de jours de rétention (défaut: 30)
   * @returns true si la notification est expirée
   */
  isExpired(retentionDays: number = 30): boolean {
    const expirationDate = new Date(this.createdAt);
    expirationDate.setDate(expirationDate.getDate() + retentionDays);
    return new Date() > expirationDate;
  }

  /**
   * Retourne l'URL de redirection selon le type de notification
   */
  getRedirectUrl(): string | null {
    switch (this.type) {
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_STATUS_UPDATED:
        return this.metadata?.taskId ? `/tasks/${this.metadata.taskId}` : '/tasks';
      case NotificationType.SCRUM_NOTE_CREATED:
        return this.metadata?.scrumNoteId 
          ? `/scrum-notes?noteId=${this.metadata.scrumNoteId}` 
          : '/scrum-notes';
      default:
        return null;
    }
  }

  /**
   * Convertit la notification en objet simple pour la sérialisation
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      message: this.message,
      recipientId: this.recipientId,
      isRead: this.isRead,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      redirectUrl: this.getRedirectUrl(),
    };
  }
}
