# Prisma 7 Configuration

## 📋 Vue d'ensemble

Ce projet utilise **Prisma 7** avec une architecture Clean Architecture + DDD. La configuration Prisma est située dans le layer infrastructure.

## 🏗️ Architecture

```
backend/src/infrastructure/database/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── prisma.config.ts       # Lien symbolique vers ../../config/prisma.config.ts
│   ├── seed.ts                # Script de seeding
│   ├── migrations/            # Historique des migrations
│   └── generated/             # Client Prisma généré (git ignored)
├── prisma.service.ts          # Service NestJS pour Prisma
├── database.module.ts         # Module global pour la base de données
├── repositories/              # Implémentation des repositories
├── mappers/                   # Mappers Prisma Model ↔ Domain Entity
└── exceptions/                # Exceptions liées à la base de données

backend/src/infrastructure/config/
├── prisma.config.ts           # Configuration Prisma 7 avec adapter PostgreSQL
├── database.config.ts         # Configuration générale de la base de données
└── ...
```

## 🔧 Configuration Prisma 7

### Nouveautés Prisma 7
- **prisma.config.ts** : Configuration centralisée dans `infrastructure/config/`
- **Adapter PostgreSQL** : Utilise `@prisma/adapter-pg` pour meilleures performances
- **Connection Pool** : Pool de connexions PostgreSQL natif avec le driver `pg`
- **TypedSQL** : Requêtes SQL typées (preview feature)

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📜 Scripts disponibles

### Génération du client
```bash
npm run prisma:generate
```
Génère le client Prisma typé à partir du schema.

### Migrations

```bash
# Créer et appliquer une nouvelle migration
npm run prisma:migrate

# Appliquer les migrations en production
npm run prisma:migrate:deploy

# Réinitialiser la base de données (⚠️ DANGER)
npm run prisma:migrate:reset
```

### Gestion de la base de données

```bash
# Pusher le schéma sans créer de migration (dev rapide)
npm run prisma:push

# Synchroniser le schéma depuis la DB existante
npm run prisma:pull

# Ouvrir Prisma Studio (GUI)
npm run prisma:studio

# Executer le seed
npm run prisma:seed
```

### Validation

```bash
# Valider le schéma Prisma
npm run prisma:validate

# Formater le schéma
npm run prisma:format
```

## 🗄️ Modèles de données

### User
Utilisateur de l'application, synchronisé avec Keycloak.

**Rôles** : `ADMIN`, `INTERN`

### Task
Tâche du projet avec statut, priorité, estimation, etc.

**Statuts** : `TODO`, `IN_PROGRESS`, `DONE` 

### ScrumNote
Notes quotidiennes du daily standup (what I did, what I will do, blockers).

## 💡 Utilisation dans le code

### Injection du service

```typescript
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { id },
    });
  }
}
```

### Accès direct aux modèles

```typescript
// Via getters
await this.prisma.user.findMany();
await this.prisma.task.create({ data: {...} });
await this.prisma.scrumNote.delete({ where: { id } });

// Via client
await this.prisma.client.user.findMany();
```

## 🔄 Workflow de développement

### 1. Modifier le schéma
Éditez `schema.prisma` pour ajouter/modifier des modèles.

### 2. Créer une migration
```bash
npm run prisma:migrate
# Donnez un nom descriptif à la migration
```

### 3. Générer le client
```bash
npm run prisma:generate
```

### 4. Utiliser dans le code
Les types TypeScript sont automatiquement mis à jour.

## 🧪 Testing

Le `PrismaService` inclut une méthode `cleanDatabase()` pour nettoyer la DB dans les tests :

```typescript
beforeEach(async () => {
  await prisma.cleanDatabase();
});
```

⚠️ **Note** : Cette méthode est bloquée en production.

## 🚀 Déploiement

En production, utilisez :

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

Ne jamais utiliser `prisma:migrate` (mode dev) en production !

## 📚 Ressources

- [Prisma 7 Docs](https://www.prisma.io/docs)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [Clean Architecture with Prisma](https://www.prisma.io/blog clean-architecture-with-prisma)
