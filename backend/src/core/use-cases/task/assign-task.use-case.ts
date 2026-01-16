import { Task } from "@/core/domain/entities/task.entity";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour assigner une tâche
 */
export interface AssignTaskInput {
  taskId: string;
  assigneeId: string;
  requesterId: string;
}

/**
 * Use Case : Assigner une tâche à un utilisateur
 * 
 * Règles métier :
 * - Seul un ADMIN peut assigner une tâche
 * - L'utilisateur à assigner doit exister
 * - La tâche doit exister
 * - On ne peut pas assigner une tâche terminée
 */
export class AssignTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: AssignTaskInput): Promise<Task> {
    // Vérifier que la tâche existe
    const task = await this.taskInteractor.findById(input.taskId);
    
    if (!task) {
      throw new TaskNotFoundException(input.taskId);
    }

    // Vérifier que l'assignee existe
    const assignee = await this.userInteractor.findById(input.assigneeId);
    
    if (!assignee) {
      throw new UserNotFoundException(input.assigneeId);
    }

    // Vérifier que le requester existe et récupérer son rôle
    const requester = await this.userInteractor.findById(input.requesterId);
    
    if (!requester) {
      throw new UserNotFoundException(input.requesterId);
    }

    // Assigner la tâche (la validation métier est dans l'entité)
    task.assign(input.assigneeId, requester.role);

    // Sauvegarder
    return this.taskInteractor.save(task);
  }
}