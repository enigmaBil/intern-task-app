import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { InvalidInputException } from "@/core/domain/exceptions/invalid-input.exception";
import { IUserInteractor } from "@/core/interactors";
import { SyncUserFromAuthUseCase } from "@/core/use-cases/user";

/**
 * Tests unitaires pour SyncUserFromAuthUseCase
 * 
 * On teste la logique de synchronisation des utilisateurs
 * depuis Keycloak vers la base de données.
 */
describe('SyncUserFromAuthUseCase', () => {
  let useCase: SyncUserFromAuthUseCase;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

  beforeEach(() => {
    // Créer un mock de l'interactor
    mockUserInteractor = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
      save: jest.fn(),
    };

    // Créer l'instance du use case avec le mock
    useCase = new SyncUserFromAuthUseCase(mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Création d\'un nouvel utilisateur', () => {
    it('should create a new user when user does not exist', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'john.doe@test.com',
        firstName: 'john',
        lastName: 'doe',
        roles: ['user'],
      };

      // Mock: L'utilisateur n'existe pas encore
      mockUserInteractor.findById.mockResolvedValue(null);

      // Mock: La sauvegarde retourne l'utilisateur créé
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('keycloak-123');
      expect(mockUserInteractor.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('keycloak-123');
      expect(result.email).toBe('john.doe@test.com'); // Normalisé en lowercase
      expect(result.firstName).toBe('John'); // Première lettre en majuscule
      expect(result.lastName).toBe('DOE'); // Tout en majuscules
      expect(result.role).toBe(UserRole.INTERN); // Par défaut INTERN
    });

    it('should create user with ADMIN role when admin role is in Keycloak roles', async () => {
      // Arrange
      const input = {
        keycloakId: 'admin-456',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['user', 'admin', 'other-role'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should create user with ADMIN role when administrator role is in Keycloak roles', async () => {
      // Arrange
      const input = {
        keycloakId: 'admin-789',
        email: 'admin2@test.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['administrator'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should normalize email to lowercase', async () => {
      // Arrange
      const input = {
        keycloakId: 'user-123',
        email: 'John.DOE@TEST.COM',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.email).toBe('john.doe@test.com');
    });

    it('should capitalize first name correctly', async () => {
      // Arrange
      const input = {
        keycloakId: 'user-123',
        email: 'test@test.com',
        firstName: 'JEAN-PIERRE',
        lastName: 'Dupont',
        roles: ['user'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.firstName).toBe('Jean-pierre');
    });

    it('should uppercase last name', async () => {
      // Arrange
      const input = {
        keycloakId: 'user-123',
        email: 'test@test.com',
        firstName: 'Jean',
        lastName: 'dupont-martin',
        roles: ['user'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.lastName).toBe('DUPONT-MARTIN');
    });
  });

  describe('execute - Mise à jour d\'un utilisateur existant', () => {
    it('should update user when data has changed', async () => {
      // Arrange
      const existingUser = User.reconstitute({
        id: 'keycloak-123',
        email: 'old.email@test.com',
        firstName: 'OldFirstName',
        lastName: 'OLDLASTNAME',
        role: UserRole.INTERN,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const input = {
        keycloakId: 'keycloak-123',
        email: 'new.email@test.com',
        firstName: 'NewFirstName',
        lastName: 'NewLastName',
        roles: ['admin'], // Changement de rôle
      };

      mockUserInteractor.findById.mockResolvedValue(existingUser);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('keycloak-123');
      expect(mockUserInteractor.save).toHaveBeenCalled();
      expect(result.email).toBe('new.email@test.com');
      expect(result.firstName).toBe('Newfirstname');
      expect(result.lastName).toBe('NEWLASTNAME');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.createdAt).toEqual(existingUser.createdAt); // CreatedAt ne change pas
    });

    it('should not save when no data has changed', async () => {
      // Arrange
      const existingUser = User.reconstitute({
        id: 'keycloak-123',
        email: 'john.doe@test.com',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.INTERN,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const input = {
        keycloakId: 'keycloak-123',
        email: 'john.doe@test.com',
        firstName: 'john', // Même après normalisation
        lastName: 'doe', // Même après normalisation
        roles: ['user'], // Même rôle INTERN
      };

      mockUserInteractor.findById.mockResolvedValue(existingUser);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('keycloak-123');
      expect(mockUserInteractor.save).not.toHaveBeenCalled(); // Pas de sauvegarde
      expect(result).toBe(existingUser); // Retourne l'utilisateur existant
    });

    it('should update only the role when only role has changed', async () => {
      // Arrange
      const existingUser = User.reconstitute({
        id: 'keycloak-123',
        email: 'john.doe@test.com',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.INTERN,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const input = {
        keycloakId: 'keycloak-123',
        email: 'john.doe@test.com',
        firstName: 'john',
        lastName: 'doe',
        roles: ['admin'], // Changement de rôle uniquement
      };

      mockUserInteractor.findById.mockResolvedValue(existingUser);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.save).toHaveBeenCalled();
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.email).toBe(existingUser.email);
      expect(result.firstName).toBe(existingUser.firstName);
      expect(result.lastName).toBe(existingUser.lastName);
    });
  });

  describe('execute - Validation des inputs', () => {
    it('should throw InvalidInputException when keycloakId is missing', async () => {
      // Arrange
      const input = {
        keycloakId: '',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('Le keycloakId est obligatoire');
    });

    it('should throw InvalidInputException when email is missing', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: '',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('L\'email est obligatoire');
    });

    it('should throw InvalidInputException when email format is invalid', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('Le format de l\'email est invalide');
    });

    it('should throw InvalidInputException when firstName is missing', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: '',
        lastName: 'Doe',
        roles: ['user'],
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('Le prénom est obligatoire');
    });

    it('should throw InvalidInputException when lastName is missing', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: '',
        roles: ['user'],
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('Le nom est obligatoire');
    });

    it('should throw InvalidInputException when roles is not an array', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: null as any,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidInputException);
      await expect(useCase.execute(input)).rejects.toThrow('Les rôles doivent être fournis');
    });

    it('should trim whitespace from inputs', async () => {
      // Arrange
      const input = {
        keycloakId: '  keycloak-123  ',
        email: 'test@test.com', // Email sans espaces pour éviter l'invalidation
        firstName: '  John  ',
        lastName: '  Doe  ',
        roles: ['user'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('  keycloak-123  '); // keycloakId n'est pas trimmé dans le findById
      expect(result.email).toBe('test@test.com'); // Email est normalisé
      expect(result.firstName).toBe('John'); // FirstName est trimmé
      expect(result.lastName).toBe('DOE'); // LastName est trimmé
    });
  });

  describe('execute - Gestion des rôles', () => {
    it('should default to INTERN role when no admin role is present', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user', 'viewer', 'editor'],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.role).toBe(UserRole.INTERN);
    });

    it('should handle empty roles array and default to INTERN', async () => {
      // Arrange
      const input = {
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [],
      };

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.role).toBe(UserRole.INTERN);
    });

    it('should be case-insensitive when matching admin role', async () => {
      // Arrange
      const testCases = [
        ['ADMIN'],
        ['Admin'],
        ['aDmIn'],
        ['ADMINISTRATOR'],
        ['Administrator'],
      ];

      mockUserInteractor.findById.mockResolvedValue(null);
      mockUserInteractor.save.mockImplementation(async (user) => user);

      for (const roles of testCases) {
        const input = {
          keycloakId: 'keycloak-123',
          email: 'test@test.com',
          firstName: 'John',
          lastName: 'Doe',
          roles,
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.role).toBe(UserRole.ADMIN);
      }
    });
  });
});
