import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { NotificationDomainService } from "@/core/domain/services/notification-domain.service";
import { ITaskInteractor, IUserInteractor, INotificationInteractor, INotificationEmitter } from "@/core/interactors";

/**
 * Input pour mettre à jour une tâche
 */
export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  deadline?: Date;
  userId: string; // L'utilisateur qui fait la demande
  userRole: UserRole; // Rôle de l'utilisateur
}

/**
 * Use Case : Mettre à jour les détails d'une tâche
 * 
 * Règles métier :
 * - Seul un ADMIN peut mettre à jour les détails d'une tâche
 * - Si un INTERN modifie le statut, l'ADMIN créateur reçoit une notification
 */
export class UpdateTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
    private readonly notificationInteractor?: INotificationInteractor,
    private readonly notificationEmitter?: INotificationEmitter,
  ) {}

  async execute(input: UpdateTaskInput): Promise<Task> {
    //Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    //Vérifier que le requester existe
    const requester = await this.userInteractor.findById(input.userId);
    
    if (!requester) {
      throw new UserNotFoundException(input.userId);
    }

    // Sauvegarder l'ancien statut pour la notification
    const oldStatus = task.status;
    const statusChanged = input.status && input.status !== oldStatus;

    //Mettre à jour (la validation métier est dans l'entité)
    if (input.status) {
      task.updateStatus(input.status, input.userId, input.userRole);
    }
    
    if (input.title || input.description || input.deadline !== undefined) {
      task.update(
        {
          title: input.title,
          description: input.description,
          deadline: input.deadline,
        },
        input.userRole,
      );
    }

    // Sauvegarder
    const savedTask = await this.taskInteractor.save(task);

    // Envoyer une notification à l'admin créateur si c'est un intern qui modifie le statut
    if (
      this.notificationInteractor && 
      this.notificationEmitter && 
      statusChanged &&
      input.userRole === UserRole.INTERN
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
            input.status!,
            `${requester.firstName} ${requester.lastName}`,
            requester.id,
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