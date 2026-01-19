import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { KeycloakUser } from '../keycloak/keycloak.strategy';

/**
 * Guard pour vérifier les rôles Keycloak (Realm + Client)
 * 
 * Vérifie si l'utilisateur possède au moins un des rôles requis
 * en combinant les realm roles et les client roles de Keycloak.
 * 
 * Realm roles: ADMIN, INTERN
 * Client roles: tasks:*, scrum_note:*
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private readonly clientId: string;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('KC_CLIENT_ID', 'mini-jira-backend');
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: KeycloakUser = request.user;

    if (!user) {
      this.logger.warn('Tentative d\'accès sans authentification');
      return false;
    }

    // Extraire les realm roles
    const realmRoles = user.realm_access?.roles || [];
    
    // Extraire les client roles
    const clientRoles = user.resource_access?.[this.clientId]?.roles || [];
    
    // Combiner tous les rôles
    const userRoles = [...realmRoles, ...clientRoles];

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `Accès refusé - User: ${user.preferred_username || user.email} | ` +
        `Rôles disponibles: [${userRoles.join(', ')}] | ` +
        `Rôles requis: [${requiredRoles.join(', ')}]`
      );
    }

    return hasRole;
  }
}