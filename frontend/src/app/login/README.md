# Page de Connexion

## Vue d'ensemble

La page de connexion offre plusieurs options d'authentification gérées par Keycloak:

1. **Connexion par email/password** - Authentification classique
2. **Connexion avec Google** - Authentification via Google OAuth2
3. **Inscription** - Création d'un nouveau compte
4. **Récupération du mot de passe** - Réinitialisation en cas d'oubli

## Fonctionnalités

### 1. Connexion Email/Password

Formulaire classique permettant aux utilisateurs de se connecter avec leurs identifiants.
Les credentials sont validés par Keycloak via l'endpoint OAuth2 token.

### 2. Connexion avec Google

Bouton "Continuer avec Google" qui redirige vers Keycloak avec l'identité provider Google.
Keycloak gère toute l'intégration OAuth2 avec Google.

**Configuration requise dans Keycloak:**
- Configurer Google comme Identity Provider dans le realm
- Ajouter les Client ID et Client Secret de Google
- Mapper les attributs utilisateur (email, nom, prénom)

### 3. Lien d'inscription

Redirige vers la page d'inscription Keycloak qui permet de créer un nouveau compte.
L'URL est construite dynamiquement:
```
{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/registrations
```

### 4. Récupération du mot de passe

Lien "Mot de passe oublié ?" qui redirige vers la page Keycloak de réinitialisation.
L'utilisateur reçoit un email avec un lien pour réinitialiser son mot de passe.

## Variables d'environnement requises

```env
# URL publique Keycloak (accessible depuis le navigateur)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080

# Nom du realm Keycloak
NEXT_PUBLIC_KEYCLOAK_REALM=Mini-Jira-Realm

# ID du client frontend
NEXT_PUBLIC_CLIENT_ID=mini-jira-frontend
```

## Architecture

L'authentification suit l'architecture Clean:

- **Presentation Layer** (`login/page.tsx`) - UI et interactions utilisateur
- **Infrastructure Layer** (`infrastructure/auth/`) - Intégration NextAuth et Keycloak
- **Use Cases** - Logique métier d'authentification

Toute la gestion des utilisateurs (création, validation, OAuth2) est déléguée à Keycloak.
Le frontend n'a aucune logique d'authentification propre.

## Configuration Keycloak

### Activer l'inscription

Dans la console Keycloak:
1. Realm Settings → Login
2. Activer "User registration"

### Configurer Google OAuth

1. Identity Providers → Add provider → Google
2. Ajouter Client ID et Client Secret de Google
3. Mapper les attributs:
   - email → email
   - given_name → firstName
   - family_name → lastName

### Configurer la récupération de mot de passe

1. Realm Settings → Login
2. Activer "Forgot password"
3. Configurer le serveur SMTP dans Realm Settings → Email

## Flux utilisateur

### Connexion email/password
```
User → Form Submit → NextAuth → Keycloak Token Endpoint → JWT → Dashboard
```

### Connexion Google
```
User → Google Button → Keycloak → Google OAuth → Keycloak → Callback → JWT → Dashboard
```

### Inscription
```
User → S'inscrire Link → Keycloak Registration → Email Verification → Login
```

### Mot de passe oublié
```
User → Forgot Link → Keycloak → Email → Reset Link → New Password → Login
```

## Sécurité

- Les credentials ne sont jamais stockés côté frontend
- Les tokens JWT sont gérés par NextAuth
- La validation des utilisateurs est faite par Keycloak
- Support HTTPS recommandé en production
- CORS configuré correctement entre frontend/backend/Keycloak

## Design

Interface moderne avec:
- Design responsive (mobile-friendly)
- États de chargement
- Messages d'erreur clairs
- Icône Google officielle
- Animations de transition
- Accessibilité (labels, focus states)
