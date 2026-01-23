import { Task } from '@/core/domain/entities/task.entity';
import { UserRole } from '@/core/domain/enums/user-role.enum';
import { ITaskInteractor } from '@/core/interactors';

/**
 * Input pour récupérer les tâches
 */
export interface GetAllTasksInput {
  userId: string;
  userRole: UserRole;
}

/**
 * Use Case: Récupérer toutes les tâches
 * 
 * Règles métier:
 * - ADMIN: voit toutes les tâches
 * - INTERN: ne voit que les tâches qui lui sont assignées
 */
export class GetAllTasksUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(input: GetAllTasksInput): Promise<Task[]> {
    // Si l'utilisateur est ADMIN, il voit toutes les tâches
    if (input.userRole === UserRole.ADMIN) {
      return this.taskInteractor.findAll();
    }

    // Si l'utilisateur est INTERN, il ne voit que ses tâches assignées
    if (input.userRole === UserRole.INTERN) {
      return this.taskInteractor.findByAssignee(input.userId);
    }

    // Par défaut, retourner un tableau vide
    return [];
  }
}