import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { UpdateTaskUseCase } from "@/core/use-cases/task";

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
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
      save: jest.fn(),
    };

    useCase = new UpdateTaskUseCase(mockTaskInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update task when requester is admin', async () => {
      // Arrange
      const task = Task.create({
        title: 'Old Title',
        description: 'Old Description',
        creatorId: 'test-creator-id',
      });

      const admin = User.reconstitute({
        id: 'admin-123',
        email: 'admin@test.com',
        firstName: 'Admin User',
        lastName: 'Adminson',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        title: 'New Title',
        description: 'New Description',
        userId: 'admin-123',
        userRole: UserRole.ADMIN,
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(admin);
      mockTaskInteractor.save.mockImplementation(async (t) => t);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New Description');
      expect(mockTaskInteractor.save).toHaveBeenCalled();
    });

    it('should throw TaskNotAssignableException when requester is not admin', async () => {
      // Arrange
      const task = Task.create({
        title: 'Old Title',
        description: 'Old Description',
        creatorId: 'test-creator-id',
      });

      const intern = User.reconstitute({
        id: 'intern-123',
        email: 'intern@test.com',
        firstName: 'Intern User',
        lastName: 'Internson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        title: 'New Title',
        userId: 'intern-123',
        userRole: UserRole.INTERN,
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(intern);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'Only admins can update task details',
      );
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });
  });
});