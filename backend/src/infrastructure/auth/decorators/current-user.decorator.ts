import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/core/domain/entities/user.entity';

/**
 * Décorateur personnalisé pour extraire l'utilisateur courant de la base de données
 * à partir du contexte de la requête HTTP.
 * 
 * Retourne l'entité User du domaine (synchronisée depuis la base de données)
 * et non le payload Keycloak brut.
 * 
 * Usage:
 * @Get()
 * async myRoute(@CurrentUser() user: User) {
 *   console.log(user.id, user.email, user.role);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    // Après validation JWT, request.user contient le payload Keycloak
    // avec l'utilisateur DB dans request.user.dbUser
    return request.user?.dbUser;
  },
);