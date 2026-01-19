import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard pour le throttling (limitation du taux de requêtes)
 * 
 * 🎯 UTILITÉ :
 * ============
 * 
 * 1. **Prévention des attaques DDoS**
 *    - Limite le nombre de requêtes par IP/utilisateur
 *    - Protège contre les floods de requêtes malveillantes
 * 
 * 2. **Protection des ressources**
 *    - Évite la surcharge du serveur
 *    - Préserve les performances pour tous les utilisateurs
 *    - Limite la consommation de CPU/RAM/Base de données
 * 
 * 3. **Équité d'accès**
 *    - Garantit que tous les utilisateurs ont un accès équitable
 *    - Empêche qu'un seul utilisateur monopolise les ressources
 * 
 * 4. **Prévention des abus**
 *    - Limite les tentatives de brute-force (login, etc.)
 *    - Protège contre le scraping excessif
 *    - Évite les boucles infinies côté client
 * 
 * 5. **Conformité et coûts**
 *    - Respecte les limites d'API externes (Keycloak, etc.)
 *    - Réduit les coûts d'infrastructure
 * 
 * 📊 CONFIGURATION PAR DÉFAUT :
 * ============================
 * - Limite : 100 requêtes par 60 secondes (configurable dans AppModule)
 * - Basée sur l'IP du client
 * - Peut être surchargée par endpoint avec @Throttle()
 * 
 * 💡 EXEMPLES D'USAGE :
 * ====================
 * 
 * 1. Protection globale (AppModule) :
 * ```typescript
 * @Module({
 *   imports: [
 *     ThrottlerModule.forRoot([{
 *       ttl: 60000,  // 60 secondes
 *       limit: 10,   // 10 requêtes max
 *     }]),
 *   ],
 * })
 * ```
 * 
 * 2. Protection spécifique d'un endpoint :
 * ```typescript
 * @Post('login')
 * @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentatives / minute
 * async login() { ... }
 * ```
 * 
 * 3. Désactiver le throttling sur un endpoint :
 * ```typescript
 * @Get('health')
 * @SkipThrottle()
 * async health() { ... }
 * ```
 * 
 * 4. Throttling différent par méthode :
 * ```typescript
 * @Post('upload')
 * @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 uploads / minute
 * async upload() { ... }
 * 
 * @Get('download')
 * @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 downloads / minute
 * async download() { ... }
 * ```
 * 
 * 🔧 PERSONNALISATION AVANCÉE :
 * ============================
 * 
 * Ce guard peut être étendu pour :
 * - Limiter par utilisateur authentifié plutôt que par IP
 * - Avoir des limites différentes selon le rôle (ADMIN vs INTERN)
 * - Intégrer Redis pour un throttling distribué
 * - Logger les tentatives de dépassement
 * - Retourner des headers informatifs (X-RateLimit-*)
 */
@Injectable()
export class ThrottleGuard extends NestThrottlerGuard {
  /**
   * Génère la clé de throttling
   * 
   * Par défaut : basée sur l'IP du client
   * Peut être surchargée pour utiliser l'ID utilisateur
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Si l'utilisateur est authentifié, utiliser son ID
    // Sinon, utiliser l'IP (comportement par défaut)
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }
    
    return req.ip || 'unknown';
  }

  /**
   * Méthode appelée pour gérer les erreurs de throttling
   * Peut être surchargée pour personnaliser les logs
   */
  protected async getErrorMessage(context: ExecutionContext, throttlerLimitDetail: any): Promise<string> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || 'anonymous';
    const ip = request.ip;
    
    // Logger la tentative de dépassement (utile pour détecter les attaques)
    console.warn(
      `⚠️  Rate limit exceeded - User: ${userId}, IP: ${ip}, Path: ${request.url}`
    );
    
    return 'Too Many Requests';
  }
}
