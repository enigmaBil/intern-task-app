import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { GetTasksByAssigneeUseCase } from "@/core/use-cases/task";

describe('GetTasksByAssigneeUseCase', () => {
  let useCase: GetTasksByAssigneeUseCase;
  let mockTaskInteractor: jest.Mocked<ITaskInteractor>;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

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

    mockUserInteractor = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
    };

    useCase = new GetTasksByAssigneeUseCase(mockTaskInteractor,mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all tasks assigned to user', async () => {
      // Arrange
      const task1 = Task.reconstitute({
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        assigneeId: 'user-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'test-creator-id',
      });

      const input = { assigneeId: 'user-123' };

      mockUserInteractor.exists.mockResolvedValue(true);
      mockTaskInteractor.findByAssignee.mockResolvedValue([task1]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.exists).toHaveBeenCalledWith('user-123');
      expect(mockTaskInteractor.findByAssignee).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toHaveLength(1);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const input = { assigneeId: 'non-existent-user' };

      mockUserInteractor.exists.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
      expect(mockTaskInteractor.findByAssignee).not.toHaveBeenCalled();
    });
  });
});