import { Task } from "@/core/domain/entities/task.entity";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { ITaskInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer une tâche par son ID
 */
export class GetTaskByIdUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskInteractor.findById(taskId);
    
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    return task;
  }
}