/**
 * Enum représentant les différents types de notifications
 * dans le système
 */
export enum NotificationType {
  /** Notification envoyée à un intern quand un admin lui assigne une tâche */
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  
  /** Notification envoyée à l'admin quand un intern modifie le statut d'une tâche */
  TASK_STATUS_UPDATED = 'TASK_STATUS_UPDATED',
  
  /** Notification envoyée aux admins quand un intern crée une scrum note */
  SCRUM_NOTE_CREATED = 'SCRUM_NOTE_CREATED',
}

/**
 * Vérifie si une valeur est un NotificationType valide
 */
export function isValidNotificationType(value: string): value is NotificationType {
  return Object.values(NotificationType).includes(value as NotificationType);
}

/**
 * Retourne tous les types de notification disponibles
 */
export function getAllNotificationTypes(): NotificationType[] {
  return Object.values(NotificationType);
}

/**
 * Retourne le titre par défaut pour un type de notification
 */
export function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    [NotificationType.TASK_ASSIGNED]: 'Nouvelle tâche assignée',
    [NotificationType.TASK_STATUS_UPDATED]: 'Statut de tâche modifié',
    [NotificationType.SCRUM_NOTE_CREATED]: 'Nouvelle note de scrum',
  };
  return titles[type];
}
