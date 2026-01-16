import { Task } from "@/core/domain/entities/task.entity";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { ITaskInteractor } from "@/core/interactors";

/**
 * Input pour récupérer une tâche
 */
export interface GetTaskByIdInput {
  taskId: string;
}

/**
 * Use Case : Récupérer une tâche par son ID
 */
export class GetTaskByIdUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(input: GetTaskByIdInput): Promise<Task> {
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    return task;
  }
}