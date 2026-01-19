/**
 * 📚 GUIDE D'UTILISATION DU THROTTLING
 * ====================================
 * 
 * Ce fichier contient des exemples d'utilisation du ThrottleGuard
 * dans différents contextes de l'application Mini Jira.
 */

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * EXEMPLE 1 : Throttling par défaut (100 req/min)
 * ================================================
 * Tous les endpoints héritent de la configuration globale
 */
@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskControllerExample {
  
  @Get()
  @ApiOperation({ summary: 'Liste toutes les tâches' })
  async getAllTasks() {
    // Ce endpoint hérite de la limite globale : 100 requêtes / minute
    return [];
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  async createTask(@Body() createTaskDto: any) {
    // Limite globale : 100 requêtes / minute
    return {};
  }
}

/**
 * EXEMPLE 2 : Throttling strict pour endpoints sensibles
 * =======================================================
 * Limiter fortement les tentatives sur des opérations sensibles
 */
@ApiTags('auth')
@Controller('auth')
export class AuthControllerExample {
  
  @Post('login')
  @SkipThrottle() // Skip le guard car géré par Keycloak
  @ApiOperation({ summary: 'Connexion utilisateur' })
  async login(@Body() credentials: any) {
    // Pas de throttling car authentification via Keycloak
    return {};
  }

  @Post('refresh')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Rafraîchir le token' })
  async refreshToken(@Body() refreshDto: any) {
    // Limite stricte : 5 tentatives par minute
    return {};
  }

  @Post('change-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @ApiOperation({ summary: 'Changer le mot de passe' })
  async changePassword(@Body() changePasswordDto: any) {
    // Très strict : 3 tentatives par 5 minutes
    // Protège contre les attaques brute-force
    return {};
  }
}

/**
 * EXEMPLE 3 : Endpoints sans throttling
 * ======================================
 * Certains endpoints ne doivent pas être limités
 */
@ApiTags('monitoring')
@Controller('health')
@SkipThrottle() // Skip pour tout le contrôleur
export class HealthControllerExample {
  
  @Get()
  @ApiOperation({ summary: 'Vérifier la santé de l\'API' })
  async checkHealth() {
    // Pas de limitation pour le health check
    // Important pour les systèmes de monitoring
    return { status: 'ok' };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métriques de l\'application' })
  async getMetrics() {
    // Pas de limitation pour les métriques
    return {};
  }
}

/**
 * EXEMPLE 4 : Throttling différencié par méthode
 * ===============================================
 * Différentes limites selon le type d'opération
 */
@ApiTags('scrum-notes')
@ApiBearerAuth('JWT-auth')
@Controller('scrum-notes')
export class ScrumNoteControllerExample {
  
  @Get()
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({ summary: 'Liste toutes les notes' })
  async getAllNotes() {
    // Lecture : limite élevée (200 req/min)
    return [];
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Créer une note de scrum' })
  async createNote(@Body() createNoteDto: any) {
    // Écriture : limite modérée (20 req/min)
    return {};
  }

  @Post('bulk-create')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Créer plusieurs notes en batch' })
  async bulkCreate(@Body() notes: any[]) {
    // Opération coûteuse : limite stricte (5 req/min)
    return {};
  }
}

/**
 * EXEMPLE 5 : Throttling avec plusieurs configurations
 * =====================================================
 * Utiliser les configurations nommées du ThrottlerModule
 */
@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserControllerExample {
  
  @Get()
  @ApiOperation({ summary: 'Liste tous les utilisateurs' })
  async getAllUsers() {
    // Configuration par défaut : 100 req/min
    return [];
  }

  @Post('sync-from-keycloak')
  @Throttle({ strict: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Synchroniser depuis Keycloak' })
  async syncFromKeycloak() {
    // Utilise la configuration 'strict' : 10 req/min
    // Opération coûteuse qui appelle une API externe
    return {};
  }
}

/**
 * 🔧 CONFIGURATION AVANCÉE
 * ========================
 * 
 * Pour une protection encore plus robuste, vous pouvez :
 * 
 * 1. Intégrer Redis pour un throttling distribué :
 * ```typescript
 * ThrottlerModule.forRoot({
 *   storage: new ThrottlerStorageRedisService(redisClient),
 *   throttlers: [{ limit: 100, ttl: 60000 }],
 * })
 * ```
 * 
 * 2. Personnaliser le guard pour limiter par utilisateur :
 * ```typescript
 * @Injectable()
 * export class CustomThrottleGuard extends ThrottlerGuard {
 *   protected async getTracker(req: Request): Promise<string> {
 *     return req.user?.id || req.ip;
 *   }
 * }
 * ```
 * 
 * 3. Ajouter des headers de rate limit dans les réponses :
 * ```typescript
 * protected async handleRequest(context: ExecutionContext): Promise<boolean> {
 *   const response = context.switchToHttp().getResponse();
 *   response.setHeader('X-RateLimit-Limit', this.limit);
 *   response.setHeader('X-RateLimit-Remaining', remaining);
 *   return super.handleRequest(context);
 * }
 * ```
 */

/**
 * 📊 RECOMMANDATIONS PAR TYPE D'ENDPOINT
 * =======================================
 * 
 * | Type d'opération          | Limite recommandée    | Raison                           |
 * |---------------------------|-----------------------|----------------------------------|
 * | Health checks             | Illimité (Skip)       | Monitoring système               |
 * | Lecture simple (GET)      | 200 req/min           | Peu coûteux en ressources        |
 * | Création/Modification     | 50 req/min            | Coût modéré en ressources        |
 * | Opérations batch          | 10 req/min            | Très coûteux                     |
 * | Authentification          | 5 req/min             | Protection brute-force           |
 * | Upload de fichiers        | 5 req/min             | Bande passante                   |
 * | Appels APIs externes      | 10 req/min            | Respecter limites externes       |
 * | Recherche/Filtrage complexe| 30 req/min           | Coût base de données élevé       |
 * 
 * ⚠️  Ces valeurs sont des suggestions. Ajustez selon :
 * - Votre infrastructure (CPU, RAM, DB)
 * - Le nombre d'utilisateurs attendus
 * - Les limites de vos APIs externes
 * - Vos besoins métier
 */
