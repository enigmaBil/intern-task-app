import { Task } from "@/core/domain/entities/task.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour créer une tâche
 */
export interface CreateTaskInput {
  title: string;
  description: string;
  deadline?: Date;
  requesterId: string; // ID de l'utilisateur qui crée la tâche
}

/**
 * Use Case : Créer une nouvelle tâche
 * 
 * Règles métier :
 * - Seul un ADMIN peut créer une tâche
 * - Les champs title et description sont obligatoires
 * - La deadline ne peut pas être dans le passé
 */
export class CreateTaskUseCase {
  constructor(
    private readonly taskInteractor: ITaskInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    // Vérifier que l'utilisateur existe et est admin
    const requester = await this.userInteractor.findById(input.requesterId);
    
    if (!requester) {
      throw new UserNotFoundException(input.requesterId);
    }

    if (requester.role !== UserRole.ADMIN) {
      throw new UnauthorizedException(input.requesterId, 'create task');
    }

    // Créer la tâche (la validation métier est realisée dans l'entité)
    const task = Task.create({
      title: input.title,
      description: input.description,
      deadline: input.deadline,
    });

    // Sauvegarder la tâche
    return this.taskInteractor.save(task);
  }
}