# 🛡️ Système de Throttling (Rate Limiting)

Le ThrottleGuard protège l'API Mini Jira contre les abus et les attaques en limitant le nombre de requêtes par utilisateur/IP.

## 🎯 Utilité du Throttling

### 1. **Sécurité**
- ✅ Prévention des attaques DDoS
- ✅ Protection contre le brute-force (login, etc.)
- ✅ Limitation du scraping abusif
- ✅ Détection d'activités suspectes

### 2. **Performance**
- ✅ Évite la surcharge du serveur
- ✅ Préserve les ressources (CPU, RAM, DB)
- ✅ Garantit des performances stables pour tous

### 3. **Équité**
- ✅ Accès équitable pour tous les utilisateurs
- ✅ Empêche la monopolisation des ressources
- ✅ Respect des quotas

### 4. **Conformité**
- ✅ Respecte les limites d'APIs externes (Keycloak)
- ✅ Réduit les coûts d'infrastructure
- ✅ Conformité réglementaire

## ⚙️ Configuration actuelle

```typescript
// app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000,   // 60 secondes
    limit: 100,   // 100 requêtes par minute
  },
  {
    name: 'strict',
    ttl: 60000,   // 60 secondes
    limit: 10,    // 10 requêtes par minute (endpoints sensibles)
  },
])
```

### Limite par défaut
- **100 requêtes par minute** pour tous les endpoints
- Basé sur l'IP ou l'ID utilisateur (si authentifié)

## 📚 Utilisation dans les contrôleurs

### Protection par défaut (héritée)
```typescript
@Get('tasks')
async getAllTasks() {
  // Limite : 100 req/min (configuration globale)
}
```

### Protection stricte
```typescript
@Post('login')
@Throttle({ default: { limit: 3, ttl: 60000 } })
async login() {
  // Limite : 3 tentatives par minute
  // Protection contre brute-force
}
```

### Désactiver le throttling
```typescript
@Get('health')
@SkipThrottle()
async health() {
  // Aucune limite pour le health check
  // Important pour les systèmes de monitoring
}
```

### Limites différentes par méthode
```typescript
// Lecture : limite élevée
@Get('scrum-notes')
@Throttle({ default: { limit: 200, ttl: 60000 } })
async getAllNotes() { }

// Écriture : limite modérée
@Post('scrum-notes')
@Throttle({ default: { limit: 20, ttl: 60000 } })
async createNote() { }

// Opération batch : limite stricte
@Post('scrum-notes/bulk')
@Throttle({ default: { limit: 5, ttl: 60000 } })
async bulkCreate() { }
```

## 📊 Recommandations par type d'endpoint

| Type d'opération | Limite recommandée | Raison |
|------------------|-------------------|---------|
| Health checks | Illimité (`@SkipThrottle()`) | Monitoring système |
| Lecture (GET) | 200 req/min | Peu coûteux |
| Écriture (POST/PUT) | 50 req/min | Coût modéré |
| Opérations batch | 10 req/min | Très coûteux |
| Authentification | 5 req/min | Protection brute-force |
| Upload fichiers | 5 req/min | Bande passante |
| APIs externes | 10 req/min | Limites externes |
| Recherche complexe | 30 req/min | Coût DB élevé |

## 🔧 Personnalisation avancée

### Limiter par utilisateur authentifié
Le guard est configuré pour utiliser l'ID utilisateur si disponible :

```typescript
protected async getTracker(req: Record<string, any>): Promise<string> {
  if (req.user?.id) {
    return `user-${req.user.id}`;
  }
  return req.ip || 'unknown';
}
```

### Logging des dépassements
Chaque dépassement de limite est loggé :

```typescript
⚠️  Rate limit exceeded - User: user-123, IP: 192.168.1.1, Path: /api/tasks
```

## 🚀 Protection distribuée avec Redis

Pour une application multi-serveurs, utilisez Redis :

```typescript
// app.module.ts
import { ThrottlerStorageRedisService } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient),
  throttlers: [{ limit: 100, ttl: 60000 }],
})
```

## 🧪 Tester le throttling

```bash
# Tester avec curl
for i in {1..150}; do 
  curl http://localhost:3001/api/tasks
  echo "Request $i"
done

# À partir de la 101ème requête, vous recevrez :
# HTTP 429 Too Many Requests
```

## 📝 Réponse en cas de dépassement

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

## ⚡ Performance

- **Stockage en mémoire** : Ultra rapide, pas de latence
- **Impact minimal** : < 1ms par requête
- **Scalabilité** : Prêt pour Redis si nécessaire

## 🔍 Monitoring

Les dépassements sont loggés dans la console et peuvent être intégrés avec :
- Sentry pour le tracking d'erreurs
- Prometheus/Grafana pour les métriques
- ELK Stack pour l'analyse des logs

## 📖 Voir aussi

- [Documentation @nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)
- [throttle-usage-examples.ts](./throttle-usage-examples.ts) - Exemples complets
- [throttle.guard.ts](./throttle.guard.ts) - Implémentation du guard
