import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { SyncUserFromAuthUseCase } from '@/core/use-cases/user';
import { User } from '@/core/domain/entities/user.entity';
import { UserRole } from '@/core/domain/enums/user-role.enum';
import { KeycloakUser } from '@/infrastructure/auth/keycloak/keycloak.strategy';

/**
 * Tests unitaires pour AuthService
 * 
 * On teste la logique du service d'authentification,
 * notamment l'intégration avec le use case de synchronisation.
 */
describe('AuthService', () => {
  let service: AuthService;
  let mockSyncUserFromAuthUseCase: jest.Mocked<SyncUserFromAuthUseCase>;

  beforeEach(async () => {
    // Créer un mock du use case
    mockSyncUserFromAuthUseCase = {
      execute: jest.fn(),
    } as any;

    // Créer le module de test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SyncUserFromAuthUseCase,
          useValue: mockSyncUserFromAuthUseCase,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Supprimer les logs pendant les tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUserFromKeycloak', () => {
    it('should synchronize user with realm roles only', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-123',
        email: 'test@test.com',
        given_name: 'John',
        family_name: 'Doe',
        realm_access: {
          roles: ['user', 'viewer'],
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user', 'viewer'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should synchronize user with client roles', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-456',
        email: 'admin@test.com',
        given_name: 'Admin',
        family_name: 'User',
        realm_access: {
          roles: ['user'],
        },
        resource_access: {
          'my-client': {
            roles: ['admin', 'manager'],
          },
          'another-client': {
            roles: ['editor'],
          },
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-456',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'USER',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-456',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['user', 'admin', 'manager', 'editor'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should handle missing realm_access', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-789',
        email: 'test@test.com',
        given_name: 'Test',
        family_name: 'User',
        // realm_access manquant
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-789',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'USER',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-789',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [],
      });
      expect(result).toBe(syncedUser);
    });

    it('should handle missing resource_access', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-101',
        email: 'test@test.com',
        given_name: 'Test',
        family_name: 'User',
        realm_access: {
          roles: ['user'],
        },
        // resource_access manquant
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-101',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'USER',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-101',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['user'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should use preferred_username when email is missing', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-202',
        preferred_username: 'johndoe',
        given_name: 'John',
        family_name: 'Doe',
        realm_access: {
          roles: ['user'],
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-202',
        email: 'johndoe',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-202',
        email: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should use default values when names are missing', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-303',
        email: 'test@test.com',
        // given_name et family_name manquants
        realm_access: {
          roles: ['user'],
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-303',
        email: 'test@test.com',
        firstName: 'Unknown',
        lastName: 'USER',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-303',
        email: 'test@test.com',
        firstName: 'Unknown',
        lastName: 'User',
        roles: ['user'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should use empty string when email and preferred_username are missing', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-404',
        given_name: 'Test',
        family_name: 'User',
        realm_access: {
          roles: ['user'],
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-404',
        email: '',
        firstName: 'Test',
        lastName: 'USER',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      // Act
      const result = await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(mockSyncUserFromAuthUseCase.execute).toHaveBeenCalledWith({
        keycloakId: 'keycloak-404',
        email: '',
        firstName: 'Test',
        lastName: 'User',
        roles: ['user'],
      });
      expect(result).toBe(syncedUser);
    });

    it('should log synchronization start and success', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-123',
        email: 'test@test.com',
        given_name: 'Test',
        family_name: 'User',
        realm_access: {
          roles: ['user'],
        },
      };

      const syncedUser = User.reconstitute({
        id: 'keycloak-123',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'USER',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockSyncUserFromAuthUseCase.execute.mockResolvedValue(syncedUser);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await service.syncUserFromKeycloak(keycloakUser);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(`Synchronisation de l'utilisateur: ${keycloakUser.email}`);
      expect(logSpy).toHaveBeenCalledWith(
        `Utilisateur synchronisé: ${syncedUser.email} (ID: ${syncedUser.id}, Role: ${syncedUser.role})`
      );
    });

    it('should log and rethrow error when synchronization fails', async () => {
      // Arrange
      const keycloakUser: KeycloakUser = {
        sub: 'keycloak-123',
        email: 'test@test.com',
        given_name: 'Test',
        family_name: 'User',
        realm_access: {
          roles: ['user'],
        },
      };

      const error = new Error('Database connection failed');
      mockSyncUserFromAuthUseCase.execute.mockRejectedValue(error);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      // Act & Assert
      await expect(service.syncUserFromKeycloak(keycloakUser)).rejects.toThrow(error);
      expect(errorSpy).toHaveBeenCalledWith(
        `Erreur lors de la synchronisation de l'utilisateur: ${error.message}`,
        error.stack,
      );
    });
  });

  describe('getUserPayload', () => {
    it('should extract user payload from domain user', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const payload = service.getUserPayload(user);

      // Assert
      expect(payload).toEqual({
        id: 'user-123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'DOE',
        role: UserRole.ADMIN,
      });
    });

    it('should return simplified payload without dates', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-456',
        email: 'intern@test.com',
        firstName: 'Jane',
        lastName: 'SMITH',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const payload = service.getUserPayload(user);

      // Assert
      expect(payload).not.toHaveProperty('createdAt');
      expect(payload).not.toHaveProperty('updatedAt');
      expect(Object.keys(payload)).toEqual(['id', 'email', 'firstName', 'lastName', 'role']);
    });
  });
});
