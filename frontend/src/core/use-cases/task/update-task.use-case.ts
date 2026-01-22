import { ITaskRepository, UpdateTaskDto } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, data: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new NotFoundException('Task', id);
    }

    return await this.taskRepository.update(id, data);
  }
}
