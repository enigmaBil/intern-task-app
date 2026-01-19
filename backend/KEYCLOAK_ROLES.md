# Configuration des rôles Keycloak - Mini JIRA

## Vue d'ensemble

Ce projet utilise **Keycloak** pour l'authentification et l'autorisation avec un système de permissions granulaires basé sur :
- **Realm roles** : Rôles globaux (ADMIN, INTERN)
- **Client roles** : Permissions spécifiques par ressource (tasks:*, scrum_note:*)

## Architecture d'autorisation

```
┌─────────────────────────────────────────────────────┐
│              JWT Token (Keycloak)                   │
├─────────────────────────────────────────────────────┤
│  realm_access:                                      │
│    roles: ["ADMIN"] ou ["INTERN"]                   │
│                                                     │
│  resource_access:                                   │
│    mini-jira-backend:                               │
│      roles: ["tasks:view", "tasks:create", ...]    │
└─────────────────────────────────────────────────────┘
                      ↓
            @UseGuards(JwtAuthGuard, RolesGuard)
                      ↓
                 @Roles('tasks:create', 'ADMIN')
                      ↓
          ✅ Accès autorisé si au moins un rôle match
```

## Rôles configurés dans Keycloak

### Realm Roles (Rôles globaux)

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | Administrateur système | Accès complet à toutes les ressources |
| **INTERN** | Utilisateur standard | Accès de base, limité à ses propres ressources |

### Client Roles (Permissions granulaires)

Client ID: `mini-jira-backend`

#### Tasks (Gestion des tâches)

| Rôle | Description | Endpoints concernés |
|------|-------------|---------------------|
| `tasks:view` | Voir les tâches | GET /tasks, GET /tasks/:id, GET /tasks/by-status/:status, GET /tasks/by-assignee/:assigneeId |
| `tasks:create` | Créer des tâches | POST /tasks |
| `tasks:update` | Modifier des tâches | PATCH /tasks/:id |
| `tasks:delete` | Supprimer des tâches | DELETE /tasks/:id |
| `tasks:assign` | Assigner des tâches | PATCH /tasks/:id/assign |
| `tasks:update_status` | Changer le statut | PATCH /tasks/:id/status |

#### Scrum Notes (Notes quotidiennes)

| Rôle | Description | Endpoints concernés |
|------|-------------|---------------------|
| `scrum_note:view` | Voir les notes | GET /scrum-notes/today, GET /scrum-notes/user/:userId |
| `scrum_note:create` | Créer des notes | POST /scrum-notes |
| `scrum_note:update` | Modifier des notes | PATCH /scrum-notes/:id |
| `scrum_note:delete` | Supprimer des notes | DELETE /scrum-notes/:id |

## Configuration dans Keycloak

### 1. Créer les Realm Roles

```
Keycloak Admin Console
→ Realm: mini-jira
→ Realm roles
→ Create role
```

Créer :
- `ADMIN`
- `INTERN`

### 2. Créer les Client Roles

```
Keycloak Admin Console
→ Clients
→ mini-jira-backend
→ Roles
→ Create role
```

Créer tous les rôles tasks:* et scrum_note:* listés ci-dessus.

### 3. Configurer les scopes du client

```
Clients → mini-jira-backend → Client scopes
→ mini-jira-backend-dedicated
→ Add mapper → By configuration → User Realm Role
→ Add mapper → By configuration → User Client Role
```

Vérifier que les mappers incluent :
- ✅ realm roles dans `realm_access.roles`
- ✅ client roles dans `resource_access.<client_id>.roles`

### 4. Assigner des rôles aux utilisateurs

```
Users → [Sélectionner utilisateur] → Role mapping
```

**Exemple - Scrum Master :**
- Realm role: `INTERN`
- Client roles:
  - `tasks:view`
  - `tasks:create`
  - `tasks:update`
  - `tasks:assign`
  - `tasks:update_status`
  - `scrum_note:view`
  - `scrum_note:create`
  - `scrum_note:update`

**Exemple - Developer :**
- Realm role: `INTERN`
- Client roles:
  - `tasks:view`
  - `tasks:update_status`
  - `scrum_note:view`
  - `scrum_note:create`
  - `scrum_note:update`

**Exemple - Admin :**
- Realm role: `ADMIN`
- (Pas besoin de client roles, ADMIN donne tous les accès)

## Utilisation dans le code

### Controllers

Tous les controllers utilisent `JwtAuthGuard` (authentication) + `RolesGuard` (authorization) :

```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  
  // Accessible avec tasks:view OU ADMIN
  @Get()
  @Roles('tasks:view', 'ADMIN')
  getAllTasks() {}
  
  // Accessible avec tasks:create OU ADMIN
  @Post()
  @Roles('tasks:create', 'ADMIN')
  createTask() {}
  
  // Accessible uniquement avec ADMIN
  @Delete(':id')
  @Roles('ADMIN')
  deleteTask() {}
}
```

### Logique OR (au moins un rôle)

Le decorator `@Roles()` utilise une logique **OR** : l'utilisateur doit avoir **AU MOINS UN** des rôles spécifiés.

```typescript
@Roles('tasks:create', 'ADMIN')
// ✅ User avec tasks:create → OK
// ✅ User avec ADMIN → OK
// ✅ User avec les deux → OK
// ❌ User sans aucun des deux → 403 Forbidden
```

### Routes sans restriction de rôle

Si aucun `@Roles()` n'est spécifié, la route est accessible à **tous les utilisateurs authentifiés** :

```typescript
@Get('profile')
// Pas de @Roles() = accessible à tous les users authentifiés (ADMIN + INTERN)
getProfile() {}
```

## Matrice des permissions par profil

### ADMIN (Administrateur)

| Ressource | Permissions |
|-----------|-------------|
| Users | ✅ Voir tous / ✅ Filtrer par rôle |
| Tasks | ✅ Toutes les opérations (CRUD complet) |
| Scrum Notes | ✅ Toutes les opérations (CRUD complet) |

**Note**: Le rôle `ADMIN` donne automatiquement accès à TOUS les endpoints, même sans client roles.

### Scrum Master (Responsable d'équipe)

| Ressource | Permissions |
|-----------|-------------|
| Users | ❌ Pas d'accès direct |
| Tasks | ✅ Voir / ✅ Créer / ✅ Modifier / ✅ Assigner / ✅ Changer statut / ❌ Supprimer |
| Scrum Notes | ✅ Voir / ✅ Créer / ✅ Modifier / ❌ Supprimer |

### Developer (Développeur)

| Ressource | Permissions |
|-----------|-------------|
| Users | ❌ Pas d'accès direct |
| Tasks | ✅ Voir / ✅ Changer statut de ses tâches / ❌ Créer / ❌ Modifier / ❌ Supprimer |
| Scrum Notes | ✅ Voir / ✅ Créer ses notes / ✅ Modifier ses notes / ❌ Supprimer |

### INTERN (Utilisateur de base)

| Ressource | Permissions |
|-----------|-------------|
| Users | ❌ Pas d'accès |
| Tasks | ❌ Selon client roles assignés |
| Scrum Notes | ❌ Selon client roles assignés |

## Tests avec curl

### 1. Obtenir un token JWT

```bash
curl -X POST "http://localhost:8080/realms/mini-jira/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=mini-jira-backend" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=scrum.master@example.com" \
  -d "password=password123"
```

### 2. Vérifier les rôles dans le token

Décoder le JWT sur [jwt.io](https://jwt.io) et vérifier :

```json
{
  "realm_access": {
    "roles": ["INTERN"]
  },
  "resource_access": {
    "mini-jira-backend": {
      "roles": [
        "tasks:view",
        "tasks:create",
        "tasks:update",
        "tasks:assign",
        "scrum_note:view",
        "scrum_note:create"
      ]
    }
  }
}
```

### 3. Tester un endpoint

```bash
# ✅ Devrait réussir (scrum master a tasks:create)
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Test"}'

# ❌ Devrait échouer 403 (scrum master n'a pas tasks:delete)
curl -X DELETE "http://localhost:3000/api/tasks/uuid-here" \
  -H "Authorization: Bearer $TOKEN"
```

## Logs et Debugging

Le `RolesGuard` log automatiquement les refus d'accès :

```
[RolesGuard] Accès refusé - User: john.doe@example.com | 
Rôles disponibles: [INTERN, tasks:view, tasks:update_status] | 
Rôles requis: [tasks:create, ADMIN]
```

Pour activer les logs de debug :

```env
LOG_LEVEL=debug
```

## Sécurité

### Bonnes pratiques

✅ **Principe du moindre privilège** : Assigner uniquement les permissions nécessaires
✅ **Séparation des rôles** : Realm roles (globaux) vs Client roles (granulaires)
✅ **Validation côté backend** : Ne jamais faire confiance au frontend
✅ **Tokens courts** : TTL JWT de 5-15 minutes
✅ **Refresh tokens** : Utiliser les refresh tokens pour renouveler

### Ce qu'il NE faut PAS faire

❌ Vérifier les rôles uniquement côté frontend
❌ Stocker les secrets client dans le code
❌ Utiliser le même client pour frontend et backend
❌ Désactiver la vérification HTTPS en production

## Évolution du système

### Ajouter une nouvelle permission

1. **Créer le client role dans Keycloak**
   ```
   Clients → mini-jira-backend → Roles → Create role
   Ex: tasks:archive
   ```

2. **Ajouter dans le controller**
   ```typescript
   @Post(':id/archive')
   @Roles('tasks:archive', 'ADMIN')
   archiveTask() {}
   ```

3. **Assigner aux utilisateurs concernés**

### Créer un nouveau profil utilisateur

1. Définir les permissions nécessaires
2. Créer un composite role (optionnel)
3. Assigner le bundle de rôles aux nouveaux utilisateurs

## Support

Pour toute question sur la configuration Keycloak :
- Documentation officielle : https://www.keycloak.org/docs/latest/
- Repository du projet : [lien vers le repo]

---

**Dernière mise à jour** : 19 janvier 2026
