import { ITaskRepository } from '@/core/domain/repositories';
import { NotFoundException } from '@/core/domain/exceptions';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new NotFoundException('Task', id);
    }

    await this.taskRepository.delete(id);
  }
}
