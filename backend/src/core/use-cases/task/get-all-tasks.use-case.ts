import { Task } from '@/core/domain/entities/task.entity';
import { ITaskInteractor } from '@/core/interactors';

/**
 * Use Case: Récupérer toutes les tâches
 * 
 * Règle métier:
 * - Tout utilisateur authentifié peut voir toutes les tâches
 */
export class GetAllTasksUseCase {
  constructor(private readonly taskInteractor: ITaskInteractor) {}

  async execute(): Promise<Task[]> {
    return this.taskInteractor.findAll();
  }
}