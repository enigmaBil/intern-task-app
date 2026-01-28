# 🚀 Mini-Jira

Un système de gestion de projets Agile/Scrum inspiré de Jira, avec authentification avancée via Keycloak et Google OAuth.

## 📋 Description

Mini-Jira est une application web complète de gestion de tâches et de projets suivant la méthodologie Scrum. Elle permet aux équipes de :
- ✅ Gérer des tâches (création, modification, assignation, suivi des statuts)
- 📝 Créer et suivre des scrum notes (daily standups, retrospectives)
- 👥 Gérer les utilisateurs et leurs permissions (ADMIN, INTERN)
- 🔐 S'authentifier via email/password ou Google OAuth
- 🎯 Suivre l'avancement des sprints et projets

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 16.1.1 (App Router)
- **Langage** : TypeScript 5.x
- **UI Framework** : React 19.2.3
- **Authentification** : NextAuth v4.24.13
- **Styling** : TailwindCSS 4.0.0
- **UI Components** : Radix UI + Shadcn/ui
- **State Management** : TanStack React Query 5.90.20
- **Forms** : React Hook Form 7.71.1
- **Validation** : Zod 4.3.5
- **Drag & Drop** : DnD Kit 6.3.1
- **Notifications** : Sonner 2.0.7
- **Date Utilities** : date-fns 4.1.0

### Backend
- **Framework** : NestJS 11.0.1
- **Langage** : TypeScript 5.7.3
- **ORM** : Prisma 7.2.0
- **Base de données** : PostgreSQL 15 + pg 8.17.1
- **Authentification** : Passport 0.7.0 + Passport-JWT 4.0.1
- **Validation** : class-validator 0.14.3 + class-transformer 0.5.1
- **API Documentation** : Swagger (NestJS) 11.2.5
- **Sécurité** : Helmet 8.1.0, Throttler 6.5.0
- **JWT** : jwks-rsa 3.2.0
- **Compression** : compression 1.8.1
- **Architecture** : Clean Architecture (Domain, Use Cases, Infrastructure, Presentation)

### Infrastructure
- **Containerisation** : Docker & Docker Compose
- **Identity Provider** : Keycloak 26.4.7

### Sécurité
- **JWT** : Tokens d'accès et refresh
- **OAuth 2.0** : Intégration Google via Keycloak
- **RBAC** : Contrôle d'accès basé sur les rôles (ADMIN, INTERN)
- **Guards** : Protection des routes et endpoints

## 📁 Structure du Projet

```
mini-jira/
├── frontend/           # Application Next.js
│   ├── src/
│   │   ├── app/       # Pages et routes (App Router)
│   │   ├── core/      # Domain, Use Cases, Interactors
│   │   ├── infrastructure/  # Auth, HTTP, Repositories
│   │   ├── presentation/    # Components, Hooks, Pages
│   │   └── shared/    # Utils, Types, Constants
│   └── Dockerfile
├── backend/           # API NestJS
│   ├── src/
│   │   ├── core/      # Domain Entities, Use Cases
│   │   ├── infrastructure/  # Database, Auth, Config
│   │   ├── presentation/    # Controllers, DTOs
│   │   └── shared/    # Guards, Filters, Interceptors
│   └── Dockerfile
├── docker-compose.yaml
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** : v22 ou supérieur
- **Docker** : v28 ou supérieur
- **Docker Compose** : v4 ou supérieur
- **Git** : Pour cloner le repository

### 1. Cloner le Projet

```bash
git clone https://github.com/enigmaBil/intern-task-app.git
cd intern-task-app
```

### 2. Configuration de l'Environnement

#### Frontend (.env.local)

Créer le fichier `frontend/.env.local` :

```env
# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Keycloak (Frontend - accès externe)
KEYCLOAK_ISSUER=http://localhost:8080/realms/Mini-Jira-Realm
FRONTEND_CLIENT_ID=mini-jira-frontend
FRONTEND_CLIENT_SECRET=your-frontend-client-secret

# Keycloak (Backend - accès Docker interne)
BACKEND_KEYCLOAK_ISSUER=http://keycloak:8080/realms/Mini-Jira-Realm
KEYCLOAK_CLIENT_ID=mini-jira-backend
KEYCLOAK_CLIENT_SECRET=your-backend-client-secret

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

#### Backend (.env)

Créer le fichier `.env` à la racine du projet copier le contenu de .env.example et adapter avec vos paramètres:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mini_jira

# Keycloak
KC_URL=http://keycloak:8080
KC_REALM=Mini-Jira-Realm
KC_CLIENT_ID=mini-jira-backend
KC_CLIENT_SECRET=your-backend-client-secret

# Application
BACKEND_PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

```

### 3. Démarrage avec Docker Compose

#### Lancer tous les services

```bash
docker compose up -d
```

Cette commande démarre :
- **PostgreSQL** (port 5432) : Base de données
- **Keycloak** (port 8080) : Identity Provider
- **Backend** (port 3001) : API NestJS
- **Frontend** (port 3000) : Application Next.js

#### Vérifier le statut des conteneurs

```bash
docker compose ps
```

### 4. Configuration Initiale de Keycloak

#### Accéder à l'interface admin

1. Ouvrir [http://localhost:8080](http://localhost:8080)
2. Connexion admin : `admin` / `admin123!` (à changer en production)

#### Créer le Realm

1. Créer un nouveau realm : **Mini-Jira-Realm**

#### Créer les Clients

**Client Frontend :**
- Client ID : `mini-jira-frontend`
- Client Protocol : `openid-connect`
- Access Type : `confidential`
- Valid Redirect URIs : `http://localhost:3000/*`
- Web Origins : `http://localhost:3000`

**Client Backend :**
- Client ID : `mini-jira-backend`
- Client Protocol : `openid-connect`
- Access Type : `confidential`
- Service Accounts Enabled : `ON`

#### Créer les Rôles

1. Créer les rôles Realm :
   - **ADMIN** : Accès complet à toutes les fonctionnalités
   - **INTERN** : Accès limité aux tâches et scrum notes

2. Assigner les rôles au client backend dans les "Client Roles"

#### Configurer Google OAuth (Optionnel)

1. Aller dans **Identity Providers**
2. Ajouter **Google**
3. Entrer Client ID et Secret de Google Cloud Console
4. Mapper les rôles si nécessaire

### 5. Initialiser la Base de Données

```bash
# Entrer dans le conteneur backend
docker compose exec backend sh

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Seed initial
npx prisma db seed
```

### 6. Créer le Premier Utilisateur

#### Option A : Via l'interface Keycloak

1. Realm > Users > Add User
2. Username : `admin@mini-jira.com`
3. Email : `admin@mini-jira.com`
4. First Name : `Admin`
5. Last Name : `User`
6. Credentials > Set Password : `admin123`
7. Role Mappings > Assign `ADMIN`

#### Option B : Via l'API de Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mini-jira.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 7. Accéder à l'Application

- **Frontend** : [http://localhost:3000](http://localhost:3000)
- **Backend API** : [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Keycloak** : [http://localhost:8080](http://localhost:8080)
- **Documentation API** : [http://localhost:3001/api/docs](http://localhost:3001/api/docs) (Swagger)


## 🔐 Authentification

L'application supporte trois méthodes d'authentification :

### 1. Email/Password
- Connexion classique avec credentials stockés dans Keycloak
- Token JWT avec refresh automatique

### 2. Google OAuth
- Authentification via compte Google
- Synchronisation automatique dans la base de données
- Attribution du rôle INTERN par défaut

### 3. Inscription
- Création de compte via formulaire
- Validation email
- Attribution du rôle INTERN

## 👥 Rôles et Permissions

### ADMIN
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs
- ✅ CRUD complet sur tasks et scrum notes
- ✅ Assignation et modification des statuts

### INTERN
- ✅ Visualisation des tâches
- ✅ Création et modification de ses propres tâches
- ✅ Création et modification de scrum notes
- ❌ Pas de suppression
- ❌ Pas de gestion des utilisateurs

## 🐛 Troubleshooting

### Problème : "Connection refused" à Keycloak

**Solution** : Vérifier que le conteneur Keycloak est démarré et accessible
```bash
docker-compose logs keycloak
curl http://localhost:8080
```

### Problème : "JWT issuer invalid"

**Solution** : Vérifier que les variables d'environnement utilisent les bonnes URLs (keycloak:8080 vs localhost:8080)

### Problème : Utilisateur Google OAuth non synchronisé

**Solution** : Le hook `useUserSync()` s'exécute automatiquement au montage du dashboard. Vérifier les logs du backend.

### Problème : Base de données non accessible

**Solution** : Vérifier les credentials et que PostgreSQL est démarré
```bash
docker compose logs postgres
docker compose exec postgres psql -U postgres -d mini_jira_db
```


## 👤 Auteur

**BILONG Emmanuel**

- GitHub: [@enigmaBil](https://github.com/enigmaBil)
- LinkedIn: [Emmanuel BILONG](https://www.linkedin.com/in/emmanuel-bilong-7b2949195/)
- Email: emmanueldigital9@gmail.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : 28 janvier 2026  
**Statut** : dev
