import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { IUserInteractor } from "@/core/interactors";
import { GetAllUsersUseCase } from "@/core/use-cases/user";

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

  beforeEach(() => {
    mockUserInteractor = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
      save: jest.fn(),
    };

    useCase = new GetAllUsersUseCase(mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all users', async () => {
      // Arrange
      const admin = User.reconstitute({
        id: 'admin-1',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const intern = User.reconstitute({
        id: 'intern-1',
        email: 'intern@test.com',
        firstName: 'Intern User',
        lastName: 'Internson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserInteractor.findAll.mockResolvedValue([admin, intern]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockUserInteractor.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockUserInteractor.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });
});