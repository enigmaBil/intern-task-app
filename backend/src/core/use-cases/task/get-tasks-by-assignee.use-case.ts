import { Task } from "@/core/domain/entities/task.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour récupérer les tâches d'un utilisateur
 */
export interface GetTasksByAssigneeInput {
  assigneeId: string;
}

/**
 * Use Case : Récupérer toutes les tâches assignées à un utilisateur
 */
export class GetTasksByAssigneeUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: GetTasksByAssigneeInput): Promise<Task[]> {
    // Vérifier que l'utilisateur existe
    const userExists = await this.userInteractor.exists(input.assigneeId);
    
    if (!userExists) {
      throw new UserNotFoundException(input.assigneeId);
    }

    return this.taskInteractor.findByAssignee(input.assigneeId);
  }
}
