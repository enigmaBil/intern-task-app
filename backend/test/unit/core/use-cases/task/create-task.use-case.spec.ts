import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { ITaskInteractor, IUserInteractor } from "@/core/interactors";
import { CreateTaskUseCase } from "@/core/use-cases/task";
import { mock } from "node:test";

/**
 * Tests unitaires pour CreateTaskUseCase
 * 
 * On mocke les interactors car on teste uniquement la logique
 * du use case, PAS l'accès à la base de données.
 */
describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockTaskInteractor: jest.Mocked<ITaskInteractor>;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

  beforeEach(() => {
    // Créer des mocks des interactors
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

    // Créer l'instance du use case avec les mocks
    useCase = new CreateTaskUseCase(mockTaskInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a task when requester is admin', async () => {
        // Arrange
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
        title: 'New Task',
        description: 'Task Description',
        deadline: new Date('2026-12-31'),
        requesterId: 'admin-123',
        };

        // Mock: L'admin existe
        mockUserInteractor.findById.mockResolvedValue(admin);

        // Mock: La sauvegarde retourne la tâche créée
        mockTaskInteractor.save.mockImplementation(async (task) => task);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(mockUserInteractor.findById).toHaveBeenCalledWith('admin-123');
        expect(mockTaskInteractor.save).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Task);
        expect(result.title).toBe('New Task');
        expect(result.description).toBe('Task Description');
    });

    it('should throw UserNotFoundException when requester does not exist', async () => {
        // Arrange
        const input = {
        title: 'New Task',
        description: 'Task Description',
        requesterId: 'non-existent-user',
        };

        // Mock: L'utilisateur n'existe pas
        mockUserInteractor.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
        expect(mockUserInteractor.findById).toHaveBeenCalledWith('non-existent-user',);
        expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when requester is not admin', async () => {
        // Arrange
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
        title: 'New Task',
        description: 'Task Description',
        requesterId: 'intern-123',
        };

        // Mock: L'intern existe
        mockUserInteractor.findById.mockResolvedValue(intern);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException,);
        await expect(useCase.execute(input)).rejects.toThrow('create task');
        expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw error when title is empty', async () => {
        // Arrange
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
        title: '',
        description: 'Task Description',
        requesterId: 'admin-123',
        };

        mockUserInteractor.findById.mockResolvedValue(admin);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow('Task title cannot be empty');
        expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw error when deadline is in the past (validation in entity)', async () => {
        // Arrange
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
        title: 'New Task',
        description: 'Task Description',
        deadline: new Date('2020-01-01'),
        requesterId: 'admin-123',
        };

        mockUserInteractor.findById.mockResolvedValue(admin);
        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow('Task deadline cannot be in the past');
        expect(mockTaskInteractor.save).not.toHaveBeenCalled();
    });
  });
});
