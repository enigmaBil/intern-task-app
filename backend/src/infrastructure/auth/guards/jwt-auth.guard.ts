import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard pour protéger les routes avec authentification JWT
 * 
 * Utilise la stratégie Passport 'jwt' (KeycloakStrategy)
 * Vérifie automatiquement le token JWT dans le header Authorization
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Détermine si la requête peut accéder à la route
   * 
   * @param context - Contexte d'exécution NestJS
   * @returns true si autorisé, false sinon
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
