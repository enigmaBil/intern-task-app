import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { DeleteTaskUseCase } from "@/core/use-cases/task";

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
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

    useCase = new DeleteTaskUseCase(mockTaskInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete task when requester is admin', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Description',
        creatorId: 'test-creator-id',
      });

      const admin = User.reconstitute({
        id: 'admin-123',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        requesterId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(admin);
      mockTaskInteractor.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockTaskInteractor.delete).toHaveBeenCalledWith('task-123');
    });

    it('should throw UnauthorizedException when requester is not admin', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Description',
        creatorId: 'test-creator-id',
      });

      const intern = User.reconstitute({
        id: 'intern-123',
        email: 'intern@test.com',
        firstName: 'Intern',
        lastName: 'User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        requesterId: 'intern-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(intern);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
      expect(mockTaskInteractor.delete).not.toHaveBeenCalled();
    });
  });
});