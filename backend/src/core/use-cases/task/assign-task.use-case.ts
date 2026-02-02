import { Task } from "@/core/domain/entities/task.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { NotificationDomainService } from "@/core/domain/services/notification-domain.service";
import { ITaskInteractor, IUserInteractor, INotificationInteractor, INotificationEmitter } from "@/core/interactors";

/**
 * Input pour assigner une tâche
 */
export interface AssignTaskInput {
  taskId: string;
  assigneeId: string;
  creatorId: string;
  requesterRole: UserRole;
}

/**
 * Use Case : Assigner une tâche à un utilisateur
 * 
 * Règles métier :
 * - Seul un ADMIN peut assigner une tâche
 * - L'utilisateur à assigner doit exister
 * - La tâche doit exister
 * - On ne peut pas assigner une tâche terminée
 * - Une notification est envoyée au stagiaire assigné
 */
export class AssignTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
    private readonly notificationInteractor?: INotificationInteractor,
    private readonly notificationEmitter?: INotificationEmitter,
  ) {}

  async execute(input: AssignTaskInput): Promise<Task> {
    // Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    // Vérifier que l'assignee existe
    const assignee = await this.userInteractor.findById(input.assigneeId);
    
    if (!assignee) {
      throw new UserNotFoundException(input.assigneeId);
    }

    // Vérifier que le requester existe et récupérer son rôle
    const requester = await this.userInteractor.findById(input.creatorId);
    
    if (!requester) {
      throw new UserNotFoundException(input.creatorId);
    }

    // Assigner la tâche (la validation métier est dans l'entité)
    task.assign(input.assigneeId, requester.role);

    // Sauvegarder
    const savedTask = await this.taskInteractor.save(task);

    // Créer et émettre la notification vers le stagiaire assigné
    if (this.notificationInteractor && this.notificationEmitter) {
      try {
        const notification = NotificationDomainService.createTaskAssignedNotification(
          input.assigneeId,
          savedTask.id,
          savedTask.title,
          `${requester.firstName} ${requester.lastName}`,
          requester.id,
        );
        
        await this.notificationInteractor.save(notification);
        this.notificationEmitter.emit(input.assigneeId, notification);
      } catch (error) {
        // Log l'erreur mais ne pas faire échouer l'opération principale
        console.error('Failed to send notification:', error);
      }
    }

    return savedTask;
  }
}