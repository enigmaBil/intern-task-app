/**
 * Types de notifications
 */
export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_UPDATED = 'TASK_STATUS_UPDATED',
  SCRUM_NOTE_CREATED = 'SCRUM_NOTE_CREATED',
}

/**
 * Métadonnées d'une notification
 */
export interface NotificationMetadata {
  taskId?: string;
  taskTitle?: string;
  newStatus?: string;
  oldStatus?: string;
  scrumNoteId?: string;
  actorName?: string;
  actorId?: string;
}

/**
 * Entité Notification côté frontend
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  redirectUrl: string | null;
  createdAt: string;
}

/**
 * Réponse de la liste des notifications
 */
export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}
