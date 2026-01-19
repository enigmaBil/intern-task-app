import { Task } from "@/core/domain/entities/task.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer toutes les tâches assignées à un utilisateur
 */
export class GetTasksByAssigneeUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(assigneeId: string): Promise<Task[]> {
    // Vérifier que l'utilisateur existe
    const userExists = await this.userInteractor.exists(assigneeId);
    
    if (!userExists) {
      throw new UserNotFoundException(assigneeId);
    }

    return this.taskInteractor.findByAssignee(assigneeId);
  }
}
