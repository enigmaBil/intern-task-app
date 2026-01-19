import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles Keycloak requis pour accéder à une route
 * 
 * Utilise les rôles natifs de Keycloak (realm roles + client roles).
 * L'utilisateur doit avoir AU MOINS UN des rôles spécifiés (logique OR).
 * 
 * Realm roles disponibles: ADMIN, INTERN
 * Client roles disponibles: tasks:*, scrum_note:*
 * 
 * @example
 * // Un seul rôle
 * @Roles('ADMIN')
 * @Post('tasks')
 * createTask() {}
 * 
 * @example
 * // Plusieurs rôles (OR logic)
 * @Roles('tasks:create', 'ADMIN')
 * @Post('tasks')
 * createTask() {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);