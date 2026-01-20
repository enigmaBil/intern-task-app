import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { ITaskInteractor } from "@/core/interactors";
import { GetTaskByIdUseCase } from "@/core/use-cases/task";

describe('GetTaskByIdUseCase', () => {
  let useCase: GetTaskByIdUseCase;
  let mockTaskInteractor: jest.Mocked<ITaskInteractor>;

  beforeEach(() => {
    mockTaskInteractor = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByAssignee: jest.fn(),
      findOverdue: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    useCase = new GetTaskByIdUseCase(mockTaskInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return task when task exists', async () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Description',
        status: TaskStatus.TODO,
        assigneeId: null,
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'test-creator-id',
      });

      mockTaskInteractor.findById.mockResolvedValue(task);

      // Act
      const result = await useCase.execute('task-123');

      // Assert
      expect(mockTaskInteractor.findById).toHaveBeenCalledWith('task-123');
      expect(result).toBe(task);
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      // Arrange
      mockTaskInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('non-existent-task')).rejects.toThrow(TaskNotFoundException);
    });
  });
});