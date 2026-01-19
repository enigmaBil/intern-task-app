import { UserRole } from "@/core/domain/enums/user-role.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Supprimer une tâche
 * 
 * Règles métier :
 * - Seul un ADMIN peut supprimer une tâche
 */
export class DeleteTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(taskId: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    //Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(taskId);
    
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    //Vérifier que le requester existe
    const requester = await this.userInteractor.findById(requesterId);
    
    if (!requester) {
      throw new UserNotFoundException(requesterId);
    }

    // Vérifier les permissions (la validation métier est dans l'entité)
    if (!task.canBeDeleted(requesterRole)) {
      throw new UnauthorizedException(requesterId, 'delete task');
    }

    //Supprimer
    await this.taskInteractor.delete(taskId);
  }
}