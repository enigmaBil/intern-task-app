import { ITaskRepository, CreateTaskDto } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: CreateTaskDto): Promise<Task> {
    return await this.taskRepository.create(data);
  }
}
