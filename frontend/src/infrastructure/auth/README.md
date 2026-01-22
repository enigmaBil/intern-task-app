# Authentification Keycloak avec NextAuth

## Architecture

L'authentification est gérée via **Keycloak** et **NextAuth** en respectant l'architecture Clean :

```
📦 frontend/src
├── 🎯 core/domain/services/
│   └── auth.service.interface.ts       # Interface IAuthService
├── 🏗️ infrastructure/auth/
│   ├── auth.config.ts                  # Configuration NextAuth + Keycloak
│   └── auth.service.ts                 # Implémentation IAuthService
├── 🎨 presentation/
│   ├── hooks/
│   │   └── useAuth.ts                  # Hook React pour l'auth
│   └── components/
│       ├── providers/
│       │   └── session-provider.tsx    # Wrapper SessionProvider
│       ├── shared/
│       │   └── AuthProvider.tsx        # Provider global
│       └── user/
│           └── UserProfile.tsx         # Composant profil utilisateur
└── 📁 app/
    ├── api/auth/[...nextauth]/
    │   └── route.ts                    # Routes API NextAuth
    └── login/
        └── page.tsx                    # Page de connexion
```

## Configuration

### Variables d'environnement (`.env`)

```env
# Keycloak
KEYCLOAK_ISSUER=http://192.168.100.144:8080/realms/Mini-Jira-Realm
FRONTEND_CLIENT_ID=mini-jira-frontend
FRONTEND_CLIENT_SECRET=nT5W6V5t2KV7gDYvzVMLyC0w9QG4Fgfd

# NextAuth
NEXTAUTH_URL=http://192.168.100.144:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# API Backend
NEXT_PUBLIC_API_URL=http://192.168.100.144:3001/api/v1
NEXT_PUBLIC_BACKEND_URL=http://192.168.100.144:3001
```

## Utilisation

### 1. Hook `useAuth`

Le hook principal pour gérer l'authentification :

```tsx
'use client';

import { useAuth } from '@/presentation/hooks';

function MyComponent() {
  const { 
    user,              // Utilisateur connecté (AuthUser | undefined)
    isAuthenticated,   // Boolean - Est authentifié ?
    isLoading,         // Boolean - Chargement ?
    login,             // Function - Se connecter
    logout,            // Function - Se déconnecter
    hasRole            // Function - Vérifier un rôle
  } = useAuth();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bonjour {user?.firstName}!</p>
          <p>Rôle: {user?.role}</p>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={login}>Se connecter</button>
      )}
    </div>
  );
}
```

### 2. Vérification des rôles

```tsx
import { useAuth, useIsAdmin, useHasRole } from '@/presentation/hooks';

function AdminPanel() {
  const { hasRole } = useAuth();
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    return <div>Accès refusé</div>;
  }
  
  return <div>Panel Admin</div>;
}

function ProjectManagerFeature() {
  const canManageProjects = useHasRole('PROJECT_MANAGER');
  
  if (!canManageProjects) return null;
  
  return <button>Créer un projet</button>;
}
```

### 3. Composant UserProfile

```tsx
import { UserProfile } from '@/presentation/components/user';

function Navbar() {
  return (
    <nav>
      <UserProfile />
    </nav>
  );
}
```

### 4. Appels API avec token

Le `httpClient` ajoute automatiquement le token Keycloak :

```tsx
import { httpClient } from '@/infrastructure/http';

async function fetchTasks() {
  // Le token est automatiquement ajouté depuis la session NextAuth
  const response = await httpClient.get('/tasks');
  return response.data;
}
```

## Flow d'authentification

1. **Utilisateur non connecté** → Redirigé vers `/login`
2. **Page /login** → Déclenche automatiquement `signIn('keycloak')`
3. **Redirection Keycloak** → L'utilisateur se connecte sur Keycloak
4. **Callback** → NextAuth récupère le token et crée la session
5. **Synchronisation** → Le backend synchronise l'utilisateur en DB
6. **Session active** → Le token est utilisé pour tous les appels API

## Middleware

Le middleware protège automatiquement les routes :

```typescript
// middleware.ts
export default withAuth(...)

// Configuration
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Routes publiques** :
- `/api/auth/*` - Routes NextAuth
- Fichiers statiques

**Routes protégées** :
- Toutes les autres routes nécessitent une authentification

## Gestion des tokens

### Refresh automatique

NextAuth gère automatiquement le refresh des tokens via le callback `jwt` :

```typescript
// auth.config.ts
callbacks: {
  async jwt({ token, account, profile }) {
    // Vérifier expiration et rafraîchir si nécessaire
    if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
      return token;
    }
    return await refreshAccessToken(token);
  }
}
```

### Logout Keycloak

Le logout est géré par l'event `signOut` :

```typescript
events: {
  async signOut({ token }) {
    // Appel à l'endpoint de logout Keycloak
    await fetch(`${issuer}/protocol/openid-connect/logout`, {
      method: 'POST',
      body: new URLSearchParams({
        id_token_hint: token.idToken,
        client_id: 'mini-jira-frontend',
      }),
    });
  }
}
```

## Rôles Keycloak

Les rôles sont extraits depuis le token JWT :

- **realm_access.roles** - Rôles au niveau du Realm
- **resource_access[client].roles** - Rôles au niveau du Client

Rôles supportés :
- `ADMIN` - Administrateur
- `PROJECT_MANAGER` - Chef de projet
- `DEVELOPER` - Développeur (par défaut)

## Types TypeScript

Les types NextAuth sont étendus dans [src/types/next-auth.d.ts](../types/next-auth.d.ts) :

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roles: string[];
  };
  accessToken?: string;
  error?: string;
}
```

## Debugging

Pour voir les informations de session en développement :

```tsx
import { useAuth } from '@/presentation/hooks';

function DebugAuth() {
  const { user, session, accessToken } = useAuth();
  
  return (
    <pre>
      {JSON.stringify({ user, session, accessToken }, null, 2)}
    </pre>
  );
}
```

## Sécurité

✅ **Bonnes pratiques** :
- Tokens JWT vérifiés côté backend
- Session stockée côté serveur (JWT)
- HTTPS en production
- Secrets dans `.env` (jamais committés)
- Refresh automatique des tokens
- Logout côté Keycloak

❌ **À éviter** :
- Ne jamais stocker les tokens dans localStorage
- Ne jamais exposer les secrets côté client
- Ne jamais désactiver la validation JWT

## Troubleshooting

### Erreur "RefreshAccessTokenError"

Le refresh token a expiré → L'utilisateur est déconnecté automatiquement.

### Redirection infinie

Vérifier que le middleware exclut bien `/api/auth/*`.

### Token non ajouté aux requêtes

Vérifier que `getSession()` retourne bien un `accessToken`.
