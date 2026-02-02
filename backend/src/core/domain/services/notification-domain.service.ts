import { Notification, NotificationMetadata } from '../entities/notification.entity';
import { NotificationType, getNotificationTitle } from '../enums/notification-type.enum';
import { TaskStatus } from '../enums/task-status.enum';

/**
 * Service de domaine pour la création de notifications
 * 
 * Contient la logique métier pour créer les différents types de notifications
 * avec les messages et métadonnées appropriées.
 */
export class NotificationDomainService {
  /**
   * Crée une notification pour l'assignation d'une tâche
   * 
   * @param recipientId - ID du stagiaire qui reçoit la notification
   * @param taskId - ID de la tâche assignée
   * @param taskTitle - Titre de la tâche
   * @param assignerName - Nom de l'admin qui assigne
   * @param assignerId - ID de l'admin qui assigne
   */
  static createTaskAssignedNotification(
    recipientId: string,
    taskId: string,
    taskTitle: string,
    assignerName: string,
    assignerId: string,
  ): Notification {
    const metadata: NotificationMetadata = {
      taskId,
      taskTitle,
      actorName: assignerName,
      actorId: assignerId,
    };

    return Notification.create({
      type: NotificationType.TASK_ASSIGNED,
      recipientId,
      title: getNotificationTitle(NotificationType.TASK_ASSIGNED),
      message: `${assignerName} vous a assigné la tâche "${taskTitle}"`,
      metadata,
    });
  }

  /**
   * Crée une notification pour la modification du statut d'une tâche
   * 
   * @param recipientId - ID de l'admin qui reçoit la notification
   * @param taskId - ID de la tâche modifiée
   * @param taskTitle - Titre de la tâche
   * @param oldStatus - Ancien statut
   * @param newStatus - Nouveau statut
   * @param modifierName - Nom du stagiaire qui modifie
   * @param modifierId - ID du stagiaire qui modifie
   */
  static createTaskStatusUpdatedNotification(
    recipientId: string,
    taskId: string,
    taskTitle: string,
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    modifierName: string,
    modifierId: string,
  ): Notification {
    const metadata: NotificationMetadata = {
      taskId,
      taskTitle,
      oldStatus,
      newStatus,
      actorName: modifierName,
      actorId: modifierId,
    };

    const statusLabels: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'À faire',
      [TaskStatus.IN_PROGRESS]: 'En cours',
      [TaskStatus.DONE]: 'Terminé',
    };

    return Notification.create({
      type: NotificationType.TASK_STATUS_UPDATED,
      recipientId,
      title: getNotificationTitle(NotificationType.TASK_STATUS_UPDATED),
      message: `${modifierName} a modifié le statut de "${taskTitle}" de "${statusLabels[oldStatus]}" à "${statusLabels[newStatus]}"`,
      metadata,
    });
  }

  /**
   * Crée une notification pour la création d'une scrum note
   * 
   * @param recipientId - ID de l'admin qui reçoit la notification
   * @param scrumNoteId - ID de la scrum note créée
   * @param creatorName - Nom du stagiaire qui crée la note
   * @param creatorId - ID du stagiaire qui crée la note
   * @param noteDate - Date de la note
   */
  static createScrumNoteCreatedNotification(
    recipientId: string,
    scrumNoteId: string,
    creatorName: string,
    creatorId: string,
    noteDate: Date,
  ): Notification {
    const metadata: NotificationMetadata = {
      scrumNoteId,
      actorName: creatorName,
      actorId: creatorId,
    };

    const formattedDate = noteDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return Notification.create({
      type: NotificationType.SCRUM_NOTE_CREATED,
      recipientId,
      title: getNotificationTitle(NotificationType.SCRUM_NOTE_CREATED),
      message: `${creatorName} a créé sa note de scrum du ${formattedDate}`,
      metadata,
    });
  }
}
