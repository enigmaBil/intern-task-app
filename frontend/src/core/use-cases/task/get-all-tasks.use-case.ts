import { ITaskRepository, TaskFilters } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(filters?: TaskFilters): Promise<Task[]> {
    return await this.taskRepository.findAll(filters);
  }
}
