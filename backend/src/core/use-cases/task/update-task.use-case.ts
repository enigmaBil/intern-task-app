import { Task } from "@/core/domain/entities/task.entity";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour mettre à jour une tâche
 */
export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  description?: string;
  deadline?: Date;
  requesterId: string;
}

/**
 * Use Case : Mettre à jour les détails d'une tâche
 * 
 * Règles métier :
 * - Seul un ADMIN peut mettre à jour les détails d'une tâche
 */
export class UpdateTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: UpdateTaskInput): Promise<Task> {
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

    //Mettre à jour (la validation métier est dans l'entité)
    task.update(
      {
        title: input.title,
        description: input.description,
        deadline: input.deadline,
      },
      requester.role,
    );

    // Sauvegarder
    return this.taskInteractor.save(task);
  }
}