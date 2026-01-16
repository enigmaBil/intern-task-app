import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { ITaskInteractor } from "@/core/interactors/task.interactor";

/**
 * Input pour récupérer les tâches par statut
 */
export interface GetTasksByStatusInput {
  status: TaskStatus;
}

/**
 * Use Case : Récupérer toutes les tâches d'un certain statut
 */
export class GetTasksByStatusUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(input: GetTasksByStatusInput): Promise<Task[]> {
    return this.taskInteractor.findByStatus(input.status);
  }
}