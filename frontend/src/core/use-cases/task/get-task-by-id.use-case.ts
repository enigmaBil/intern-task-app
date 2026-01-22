import { ITaskRepository } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new NotFoundException('Task', id);
    }

    return task;
  }
}
