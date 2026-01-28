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
 * Supporte également le mapping des rôles DB (ADMIN, INTERN) vers les permissions granulaires.
 * 
 * Realm roles: ADMIN, INTERN
 * Client roles: tasks:*, scrum_note:*
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private readonly clientId: string;

  // Mapping des rôles DB vers les permissions
  private readonly rolePermissions: Record<string, string[]> = {
    ADMIN: ['*'], // Admin a accès à tout
    INTERN: [
      'tasks:view',
      'tasks:create',
      'tasks:update',
      'tasks:update_status',
      'tasks:assign',
      'scrum_note:view',
      'scrum_note:create',
      'scrum_note:update',
    ],
  };

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
    const user: KeycloakUser & { dbUser?: any } = request.user;

    if (!user) {
      this.logger.warn('Tentative d\'accès sans authentification');
      return false;
    }

    // Priorité 1: Utiliser le rôle de la base de données (synchronisé)
    // Cela permet aux utilisateurs Google OAuth de fonctionner correctement
    if (user.dbUser?.role) {
      const dbRole = user.dbUser.role;
      
      // Récupérer les permissions associées au rôle DB
      const userPermissions = this.rolePermissions[dbRole] || [];
      
      // ADMIN a accès à tout
      if (userPermissions.includes('*')) {
        return true;
      }
      
      // Vérifier si l'utilisateur a au moins une des permissions requises
      const hasPermission = requiredRoles.some((role) => 
        userPermissions.includes(role) || role === dbRole
      );
      
      if (!hasPermission) {
        this.logger.warn(
          `Accès refusé - User: ${user.preferred_username || user.email} | ` +
          `Rôle DB: ${dbRole} | Permissions: [${userPermissions.join(', ')}] | ` +
          `Rôles requis: [${requiredRoles.join(', ')}]`
        );
      }
      
      return hasPermission;
    }

    // Priorité 2: Fallback sur les rôles Keycloak (pour compatibilité)
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