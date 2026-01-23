import { ITaskRepository, AssignTaskDto } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';

export class AssignTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, data: AssignTaskDto): Promise<Task> {
    return this.taskRepository.assign(taskId, data);
  }
}
