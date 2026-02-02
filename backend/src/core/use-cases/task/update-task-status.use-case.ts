import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { NotificationDomainService } from "@/core/domain/services/notification-domain.service";
import { ITaskInteractor, IUserInteractor, INotificationInteractor, INotificationEmitter } from "@/core/interactors";

/**
 * Input pour mettre à jour le statut d'une tâche
 */
export interface UpdateTaskStatusInput {
  taskId: string;
  newStatus: TaskStatus;
  userId: string;
}

/**
 * Use Case : Mettre à jour le statut d'une tâche
 * 
 * Règles métier :
 * - Un ADMIN peut changer le statut de n'importe quelle tâche
 * - Un INTERN ne peut changer le statut que de ses tâches assignées
 * - On ne peut pas repasser une tâche DONE en TODO
 * - Si un INTERN modifie le statut, l'ADMIN créateur reçoit une notification
 */
export class UpdateTaskStatusUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
    private readonly notificationInteractor?: INotificationInteractor,
    private readonly notificationEmitter?: INotificationEmitter,
  ) {}

  async execute(input: UpdateTaskStatusInput): Promise<Task> {
    // Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    // Vérifier que l'utilisateur existe et récupérer son rôle
    const user = await this.userInteractor.findById(input.userId);
    
    if (!user) {
      throw new UserNotFoundException(input.userId);
    }

    // Sauvegarder l'ancien statut pour la notification
    const oldStatus = task.status;

    // Mettre à jour le statut (la validation métier est dans l'entité)
    task.updateStatus(input.newStatus, input.userId, user.role);

    // Sauvegarder
    const savedTask = await this.taskInteractor.save(task);

    // Envoyer une notification à l'admin créateur si c'est un intern qui modifie
    if (
      this.notificationInteractor && 
      this.notificationEmitter && 
      user.role === UserRole.INTERN &&
      oldStatus !== input.newStatus
    ) {
      try {
        // Récupérer le créateur de la tâche (admin)
        const creator = await this.userInteractor.findById(savedTask.creatorId);
        
        if (creator && creator.role === UserRole.ADMIN) {
          const notification = NotificationDomainService.createTaskStatusUpdatedNotification(
            creator.id,
            savedTask.id,
            savedTask.title,
            oldStatus,
            input.newStatus,
            `${user.firstName} ${user.lastName}`,
            user.id,
          );
          
          await this.notificationInteractor.save(notification);
          this.notificationEmitter.emit(creator.id, notification);
        }
      } catch (error) {
        // Log l'erreur mais ne pas faire échouer l'opération principale
        console.error('Failed to send notification:', error);
      }
    }

    return savedTask;
  }
}
