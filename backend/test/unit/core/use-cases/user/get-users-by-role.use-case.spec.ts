import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { IUserInteractor } from "@/core/interactors";
import { GetUsersByRoleUseCase } from "@/core/use-cases/user";


describe('GetUsersByRoleUseCase', () => {
  let useCase: GetUsersByRoleUseCase;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

  beforeEach(() => {
    mockUserInteractor = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
    };

    useCase = new GetUsersByRoleUseCase(mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all users with ADMIN role', async () => {
      // Arrange
      const admin1 = User.reconstitute({
        id: 'admin-1',
        email: 'admin1@test.com',
        firstName: 'Admin One',
        lastName: 'Adminson',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const admin2 = User.reconstitute({
        id: 'admin-2',
        email: 'admin2@test.com',
        firstName: 'Admin Two',
        lastName: 'Adminson',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = { role: UserRole.ADMIN };

      mockUserInteractor.findByRole.mockResolvedValue([admin1, admin2]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findByRole).toHaveBeenCalledWith(UserRole.ADMIN);
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.ADMIN);
    });

    it('should return all users with INTERN role', async () => {
      // Arrange
      const intern1 = User.reconstitute({
        id: 'intern-1',
        email: 'intern1@test.com',
        firstName: 'Intern One',
        lastName: 'Internson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = { role: UserRole.INTERN };

      mockUserInteractor.findByRole.mockResolvedValue([intern1]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findByRole).toHaveBeenCalledWith(UserRole.INTERN);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.INTERN);
    });

    it('should return empty array when no users with that role exist', async () => {
      // Arrange
      const input = { role: UserRole.ADMIN };

      mockUserInteractor.findByRole.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual([]);
    });
  });
});