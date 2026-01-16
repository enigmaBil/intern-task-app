import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour supprimer une tâche
 */
export interface DeleteTaskInput {
  taskId: string;
  requesterId: string;
}

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

  async execute(input: DeleteTaskInput): Promise<void> {
    //Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    //Vérifier que le requester existe et récupérer son rôle
    const requester = await this.userInteractor.findById(input.requesterId);
    
    if (!requester) {
      throw new UserNotFoundException(input.requesterId);
    }

    // Vérifier les permissions (la validation métier est dans l'entité)
    if (!task.canBeDeleted(requester.role)) {
      throw new UnauthorizedException(input.requesterId, 'delete task');
    }

    //Supprimer
    await this.taskInteractor.delete(input.taskId);
  }
}