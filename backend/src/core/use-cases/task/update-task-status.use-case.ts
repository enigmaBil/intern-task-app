import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour mettre à jour le statut d'une tâche
 */
export interface UpdateTaskStatusInput {
  taskId: string;
  newStatus: TaskStatus;
  userId: string;
}

/**
 * Use Case : Mettre à jour le statut d'une tâche
 * 
 * Règles métier :
 * - Un ADMIN peut changer le statut de n'importe quelle tâche
 * - Un INTERN ne peut changer le statut que de ses tâches assignées
 * - On ne peut pas repasser une tâche DONE en TODO
 */
export class UpdateTaskStatusUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: UpdateTaskStatusInput): Promise<Task> {
    // Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    // Vérifier que l'utilisateur existe et récupérer son rôle
    const user = await this.userInteractor.findById(input.userId);
    
    if (!user) {
      throw new UserNotFoundException(input.userId);
    }

    // Mettre à jour le statut (la validation métier est dans l'entité)
    task.updateStatus(input.newStatus, input.userId, user.role);

    // Sauvegarder
    return this.taskInteractor.save(task);
  }
}
