import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IUserInteractor } from "@/core/interactors";
import { GetUserByIdUseCase } from "@/core/use-cases/user";

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
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

    useCase = new GetUserByIdUseCase(mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return user when user exists', async () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'Userton',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = { userId: 'user-123' };

      mockUserInteractor.findById.mockResolvedValue(user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(user);
      expect(result.id).toBe('user-123');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const input = { userId: 'non-existent-user' };

      mockUserInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('non-existent-user');
    });
  });
});