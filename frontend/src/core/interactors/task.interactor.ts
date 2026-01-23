import { TaskRepository } from '@/infrastructure/repositories';
import {
  CreateTaskUseCase,
  UpdateTaskUseCase,
  DeleteTaskUseCase,
  GetAllTasksUseCase,
  GetTaskByIdUseCase,
  AssignTaskUseCase,
} from '../use-cases/task';

export class TaskInteractor {
  private taskRepository: TaskRepository;
  
  // Use cases
  public readonly createTask: CreateTaskUseCase;
  public readonly updateTask: UpdateTaskUseCase;
  public readonly deleteTask: DeleteTaskUseCase;
  public readonly getAllTasks: GetAllTasksUseCase;
  public readonly getTaskById: GetTaskByIdUseCase;
  public readonly assignTask: AssignTaskUseCase;

  constructor() {
    this.taskRepository = new TaskRepository();
    
    // Initialize use cases
    this.createTask = new CreateTaskUseCase(this.taskRepository);
    this.updateTask = new UpdateTaskUseCase(this.taskRepository);
    this.deleteTask = new DeleteTaskUseCase(this.taskRepository);
    this.getAllTasks = new GetAllTasksUseCase(this.taskRepository);
    this.getTaskById = new GetTaskByIdUseCase(this.taskRepository);
    this.assignTask = new AssignTaskUseCase(this.taskRepository);
  }
}

// Singleton instance
export const taskInteractor = new TaskInteractor();
