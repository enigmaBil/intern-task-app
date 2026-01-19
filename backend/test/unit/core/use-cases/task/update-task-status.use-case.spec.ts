import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { InvalidTaskTransitionException } from "@/core/domain/exceptions/invalid-task-transition.exception";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { UpdateTaskStatusUseCase } from "@/core/use-cases/task/update-task-status.use-case";

describe('UpdateTaskStatusUseCase', () => {
  let useCase: UpdateTaskStatusUseCase;
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

    useCase = new UpdateTaskStatusUseCase(mockTaskInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update status when intern updates own assigned task', async () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Description',
        creatorId: 'test-creator-id',
        status: TaskStatus.TODO,
        assigneeId: 'intern-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        newStatus: TaskStatus.IN_PROGRESS,
        userId: 'intern-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(intern);
      mockTaskInteractor.save.mockImplementation(async (t) => t);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(mockTaskInteractor.save).toHaveBeenCalled();
    });

    it('should update status when admin updates any task', async () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Description',
        status: TaskStatus.TODO,
        assigneeId: 'intern-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'test-creator-id',
      });

      const admin = User.reconstitute({
        id: 'admin-456',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        newStatus: TaskStatus.IN_PROGRESS,
        userId: 'admin-456',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(admin);
      mockTaskInteractor.save.mockImplementation(async (t) => t);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(mockTaskInteractor.save).toHaveBeenCalled();
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      // Arrange
      const input = {
        taskId: 'non-existent-task',
        newStatus: TaskStatus.IN_PROGRESS,
        userId: 'user-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(TaskNotFoundException);
    });

    it('should throw InvalidTaskTransitionException when moving DONE to TODO', async () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Description',
        status: TaskStatus.DONE,
        assigneeId: 'intern-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        newStatus: TaskStatus.TODO,
        userId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(admin);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidTaskTransitionException);
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });
  });
});