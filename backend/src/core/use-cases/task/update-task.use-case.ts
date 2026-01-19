import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
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
  status?: TaskStatus;
  deadline?: Date;
  userId: string; // L'utilisateur qui fait la demande
  userRole: UserRole; // Rôle de l'utilisateur
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

    //Vérifier que le requester existe
    const requester = await this.userInteractor.findById(input.userId);
    
    if (!requester) {
      throw new UserNotFoundException(input.userId);
    }

    //Mettre à jour (la validation métier est dans l'entité)
    if (input.status) {
      task.updateStatus(input.status, input.userId, input.userRole);
    }
    
    if (input.title || input.description || input.deadline !== undefined) {
      task.update(
        {
          title: input.title,
          description: input.description,
          deadline: input.deadline,
        },
        input.userRole,
      );
    }

    // Sauvegarder
    return this.taskInteractor.save(task);
  }
}