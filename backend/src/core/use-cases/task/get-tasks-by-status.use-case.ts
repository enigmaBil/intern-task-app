import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { ITaskInteractor } from "@/core/interactors/task.interactor";

/**
 * Use Case : Récupérer toutes les tâches d'un certain statut
 */
export class GetTasksByStatusUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(status: TaskStatus): Promise<Task[]> {
    return this.taskInteractor.findByStatus(status);
  }
}