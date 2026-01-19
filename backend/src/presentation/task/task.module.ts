import { Module } from '@nestjs/common';
import { AssignTaskUseCase } from '@/core/use-cases/task/assign-task.use-case';
import { CreateTaskUseCase } from '@/core/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from '@/core/use-cases/task/delete-task.use-case';
import { GetAllTasksUseCase } from '@/core/use-cases/task/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@/core/use-cases/task/get-task-by-id.use-case';
import { GetTasksByAssigneeUseCase } from '@/core/use-cases/task/get-tasks-by-assignee.use-case';
import { GetTasksByStatusUseCase } from '@/core/use-cases/task/get-tasks-by-status.use-case';
import { UpdateTaskUseCase } from '@/core/use-cases/task/update-task.use-case';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { TaskController } from './task.controller';

/**
 * Module de présentation pour les tâches
 * 
 * Gère les endpoints HTTP pour les opérations CRUD sur les tâches.
 * Injecte tous les use-cases et les repositories via DatabaseModule.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [
    // Use Case: Create Task
    {
      provide: CreateTaskUseCase,
      useFactory: (taskInteractor, userInteractor) =>
        new CreateTaskUseCase(taskInteractor, userInteractor),
      inject: ['ITaskInteractor', 'IUserInteractor'],
    },
    // Use Case: Get All Tasks
    {
      provide: GetAllTasksUseCase,
      useFactory: (taskInteractor) => new GetAllTasksUseCase(taskInteractor),
      inject: ['ITaskInteractor'],
    },
    // Use Case: Get Task By ID
    {
      provide: GetTaskByIdUseCase,
      useFactory: (taskInteractor) => new GetTaskByIdUseCase(taskInteractor),
      inject: ['ITaskInteractor'],
    },
    // Use Case: Update Task
    {
      provide: UpdateTaskUseCase,
      useFactory: (taskInteractor, userInteractor) =>
        new UpdateTaskUseCase(taskInteractor, userInteractor),
      inject: ['ITaskInteractor', 'IUserInteractor'],
    },
    // Use Case: Delete Task
    {
      provide: DeleteTaskUseCase,
      useFactory: (taskInteractor, userInteractor) =>
        new DeleteTaskUseCase(taskInteractor, userInteractor),
      inject: ['ITaskInteractor', 'IUserInteractor'],
    },
    // Use Case: Assign Task
    {
      provide: AssignTaskUseCase,
      useFactory: (taskInteractor, userInteractor) =>
        new AssignTaskUseCase(taskInteractor, userInteractor),
      inject: ['ITaskInteractor', 'IUserInteractor'],
    },
    // Use Case: Get Tasks By Status
    {
      provide: GetTasksByStatusUseCase,
      useFactory: (taskInteractor) => new GetTasksByStatusUseCase(taskInteractor),
      inject: ['ITaskInteractor'],
    },
    // Use Case: Get Tasks By Assignee
    {
      provide: GetTasksByAssigneeUseCase,
      useFactory: (taskInteractor, userInteractor) =>
        new GetTasksByAssigneeUseCase(taskInteractor, userInteractor),
      inject: ['ITaskInteractor', 'IUserInteractor'],
    },
  ],
  exports: [],
})
export class TaskModule {}
