import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { TaskNotAssignableException } from "@/core/domain/exceptions/task-not-assignable.exception";
import { TaskNotFoundException } from "@/core/domain/exceptions/task-not-found.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { AssignTaskUseCase } from "@/core/use-cases/task/assign-task.use-case";

describe('AssignTaskUseCase', () => {
  let useCase: AssignTaskUseCase;
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

    useCase = new AssignTaskUseCase(mockTaskInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign task when requester is admin', async () => {
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

      const admin = User.reconstitute({
        id: 'admin-123',
        email: 'admin@test.com',
        firstName: 'Admin User',
        lastName: 'Adminson',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        assigneeId: 'intern-123',
        requesterId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById
        .mockResolvedValueOnce(intern) // First call: assignee
        .mockResolvedValueOnce(admin); // Second call: requester
      mockTaskInteractor.save.mockImplementation(async (t) => t);
      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockTaskInteractor.findById).toHaveBeenCalledWith('task-123');
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('intern-123');
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('admin-123');
      expect(mockTaskInteractor.save).toHaveBeenCalled();
      expect(result.assigneeId).toBe('intern-123');
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      // Arrange
      const input = {
        taskId: 'non-existent-task',
        assigneeId: 'intern-123',
        requesterId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(TaskNotFoundException);
      expect(mockUserInteractor.findById).not.toHaveBeenCalled();
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when assignee does not exist', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Description',
        creatorId: 'test-creator-id',
      });

      const input = {
        taskId: 'task-123',
        assigneeId: 'non-existent-user',
        requesterId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw TaskNotAssignableException when requester is not admin', async () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Description',
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

      const assignee = User.reconstitute({
        id: 'intern-456',
        email: 'assignee@test.com',
        firstName: 'Assignee User',
        lastName: 'Assigneeson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        taskId: 'task-123',
        assigneeId: 'intern-456',
        requesterId: 'intern-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById
        .mockResolvedValueOnce(assignee) // assignee
        .mockResolvedValueOnce(intern); // requester

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(TaskNotAssignableException);
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw TaskNotAssignableException when task is already DONE', async () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Description',
        status: TaskStatus.DONE,
        assigneeId: null,
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
        assigneeId: 'intern-123',
        requesterId: 'admin-123',
      };

      mockTaskInteractor.findById.mockResolvedValue(task);
      mockUserInteractor.findById
        .mockResolvedValueOnce(intern) // assignee (intern-123)
        .mockResolvedValueOnce(admin); // requester (admin-123)

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(TaskNotAssignableException);
      expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });
  });
});