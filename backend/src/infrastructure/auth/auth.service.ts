import { Injectable, Logger } from '@nestjs/common';
import { SyncUserFromAuthUseCase } from '@/core/use-cases/user';
import { User } from '@/core/domain/entities/user.entity';
import { KeycloakUser } from './keycloak/keycloak.strategy';

/**
 * Service d'authentification pour gérer la synchronisation
 * des utilisateurs entre Keycloak et la base de données
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly syncUserFromAuthUseCase: SyncUserFromAuthUseCase,
  ) {}

  /**
   * Synchronise un utilisateur Keycloak avec la base de données
   * 
   * Cette méthode est appelée automatiquement lors de la validation
   * du token JWT par la stratégie Keycloak.
   * 
   * @param keycloakUser - Informations de l'utilisateur extraites du JWT
   * @returns L'utilisateur synchronisé
   */
  async syncUserFromKeycloak(keycloakUser: KeycloakUser): Promise<User> {
    this.logger.log(`Synchronisation de l'utilisateur: ${keycloakUser.email}`);

    try {
      // Extraire les rôles realm de Keycloak
      const realmRoles = keycloakUser.realm_access?.roles || [];
      
      // Extraire les rôles client de Keycloak (si configuré)
      const clientRoles: string[] = [];
      if (keycloakUser.resource_access) {
        Object.values(keycloakUser.resource_access).forEach(access => {
          if (access.roles) {
            clientRoles.push(...access.roles);
          }
        });
      }

      // Combiner tous les rôles
      const allRoles = [...realmRoles, ...clientRoles];

      // Préparer l'input pour le use case
      const syncInput = {
        keycloakId: keycloakUser.sub,
        email: keycloakUser.email || keycloakUser.preferred_username || '',
        firstName: keycloakUser.given_name || 'Unknown',
        lastName: keycloakUser.family_name || 'User',
        roles: allRoles,
      };

      // Exécuter la synchronisation
      const user = await this.syncUserFromAuthUseCase.execute(syncInput);

      this.logger.log(
        `Utilisateur synchronisé: ${user.email} (ID: ${user.id}, Role: ${user.role})`
      );

      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la synchronisation de l'utilisateur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Extrait les informations utilisateur pour les attacher à la requête
   * 
   * @param user - Utilisateur du domaine
   * @returns Objet simplifié à attacher à request.user
   */
  getUserPayload(user: User): {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
