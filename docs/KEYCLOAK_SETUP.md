# Configuration Keycloak pour Mini-Jira

Ce document explique comment configurer Keycloak pour supporter toutes les fonctionnalités d'authentification.

## 1. Configuration de base du Realm

### Activer l'inscription utilisateur

1. Connectez-vous à la console Keycloak Admin
2. Sélectionnez le realm `Mini-Jira-Realm`
3. Allez dans **Realm Settings** → **Login**
4. Activez les options suivantes:
   - ✅ User registration
   - ✅ Forgot password
   - ✅ Remember me
   - ✅ Verify email (recommandé)

## 2. Configuration du serveur Email (requis pour réinitialisation)

### Configuration SMTP

1. **Realm Settings** → **Email**
2. Remplissez les informations SMTP:

```
Host: smtp.gmail.com (exemple avec Gmail)
Port: 587
From: noreply@votredomaine.com
Enable StartTLS: ON
Enable Authentication: ON
Username: votre-email@gmail.com
Password: votre-mot-de-passe-application
```

#### Pour Gmail:
- Créer un "App Password" dans les paramètres Google
- Ne pas utiliser votre mot de passe principal
- Documentation: https://support.google.com/accounts/answer/185833

#### Autres fournisseurs SMTP:
- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://www.mailgun.com
- **AWS SES**: https://aws.amazon.com/ses/

### Tester la configuration

1. Cliquez sur "Test connection" après avoir sauvegardé
2. Un email de test sera envoyé à l'adresse configurée

## 3. Configuration de Google OAuth

### 3.1 Créer des credentials Google

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'API "Google+ API"
4. Allez dans **APIs & Services** → **Credentials**
5. Cliquez sur **Create Credentials** → **OAuth 2.0 Client ID**
6. Configurez l'écran de consentement OAuth si nécessaire:
   - Type d'application: External
   - Nom de l'application: Mini-Jira
   - Email de support: votre email
   - Domaines autorisés: localhost, votredomaine.com

7. Créez le Client ID OAuth:
   - Type d'application: **Web application**
   - Nom: Mini-Jira Keycloak
   - URIs de redirection autorisés:
     ```
     http://localhost:8080/realms/Mini-Jira-Realm/broker/google/endpoint
     https://votredomaine.com/realms/Mini-Jira-Realm/broker/google/endpoint
     ```

8. Notez le **Client ID** et **Client Secret**

### 3.2 Configurer Google dans Keycloak

1. Dans la console Keycloak Admin
2. Sélectionnez votre realm `Mini-Jira-Realm`
3. Allez dans **Identity Providers**
4. Cliquez sur **Add provider** → **Google**
5. Configurez:

```
Alias: google
Display Name: Google
Enabled: ON
Store Tokens: ON
Stored Tokens Readable: OFF
Trust Email: ON
First Login Flow: first broker login
Sync Mode: Import

Client ID: [Votre Client ID Google]
Client Secret: [Votre Client Secret Google]
```

6. Copiez l'URL de redirection affichée et ajoutez-la dans Google Cloud Console
7. Sauvegardez

### 3.3 Mapper les attributs utilisateur

1. Toujours dans la configuration de l'Identity Provider Google
2. Allez dans l'onglet **Mappers**
3. Créez les mappers suivants:

#### Mapper Email
```
Name: email
Sync Mode Override: inherit
Mapper Type: Attribute Importer
Attribute Name: email
User Attribute Name: email
```

#### Mapper First Name
```
Name: firstName
Sync Mode Override: inherit
Mapper Type: Attribute Importer
Attribute Name: given_name
User Attribute Name: firstName
```

#### Mapper Last Name
```
Name: lastName
Sync Mode Override: inherit
Mapper Type: Attribute Importer
Attribute Name: family_name
User Attribute Name: lastName
```

## 4. Configuration des Clients

### Client Frontend (mini-jira-frontend)

1. **Clients** → Sélectionnez `mini-jira-frontend`
2. Configuration:

```
Client ID: mini-jira-frontend
Enabled: ON
Client Protocol: openid-connect
Access Type: public
Standard Flow Enabled: ON
Direct Access Grants Enabled: ON
Valid Redirect URIs:
  http://localhost:3000/*
  https://votredomaine.com/*
Web Origins:
  http://localhost:3000
  https://votredomaine.com
```

### Client Backend (mini-jira-backend)

1. **Clients** → Sélectionnez `mini-jira-backend`
2. Configuration:

```
Client ID: mini-jira-backend
Enabled: ON
Client Protocol: openid-connect
Access Type: confidential
Service Accounts Enabled: ON
Authorization Enabled: ON
Valid Redirect URIs: *
```

3. Allez dans l'onglet **Credentials** et copiez le **Secret**
4. Mettez à jour `FRONTEND_CLIENT_SECRET` dans votre `.env`

## 5. Rôles et Permissions

### Créer les rôles

1. **Realm Roles** → **Create Role**
2. Créez les rôles suivants:
   - `ADMIN` - Administrateur système
   - `MANAGER` - Chef de projet
   - `DEVELOPER` - Développeur
   - `VIEWER` - Observateur

### Assigner les rôles par défaut

1. **Realm Settings** → **Default Roles**
2. Ajoutez `DEVELOPER` comme rôle par défaut pour les nouveaux utilisateurs

## 6. Configuration des thèmes (optionnel)

### Personnaliser l'apparence Keycloak

1. **Realm Settings** → **Themes**
2. Configurez:
   - Login Theme: keycloak
   - Account Theme: keycloak
   - Admin Console Theme: keycloak
   - Email Theme: keycloak

Vous pouvez créer des thèmes personnalisés pour matcher le design de Mini-Jira.

## 7. Variables d'environnement

Après configuration, mettez à jour votre fichier `.env`:

```env
# Keycloak Public URLs
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=Mini-Jira-Realm
NEXT_PUBLIC_CLIENT_ID=mini-jira-frontend

# Keycloak Internal URLs (Docker)
KEYCLOAK_ISSUER=http://keycloak:8080/realms/Mini-Jira-Realm

# Client Credentials
FRONTEND_CLIENT_ID=mini-jira-frontend
FRONTEND_CLIENT_SECRET=[copié depuis Keycloak]

# Backend Keycloak
KEYCLOAK_REALM=Mini-Jira-Realm
KEYCLOAK_CLIENT_ID=mini-jira-backend
KEYCLOAK_CLIENT_SECRET=[copié depuis Keycloak]
KEYCLOAK_URL=http://keycloak:8080
```

## 8. Test de la configuration

### Tester l'inscription

1. Allez sur http://localhost:3000/login
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire d'inscription Keycloak
4. Vérifiez que vous recevez l'email de vérification (si activé)
5. Connectez-vous avec le nouveau compte

### Tester la récupération de mot de passe

1. Sur la page de login, cliquez sur "Mot de passe oublié ?"
2. Entrez votre email
3. Vérifiez la réception de l'email
4. Suivez le lien et réinitialisez votre mot de passe
5. Connectez-vous avec le nouveau mot de passe

### Tester Google OAuth

1. Sur la page de login, cliquez sur "Continuer avec Google"
2. Vous êtes redirigé vers Google pour vous authentifier
3. Autorisez l'application Mini-Jira
4. Vous êtes redirigé vers le dashboard
5. Vérifiez que votre compte est créé dans Keycloak avec les infos Google

## 9. Dépannage

### L'inscription ne fonctionne pas
- Vérifiez que "User registration" est activé dans Realm Settings
- Vérifiez les Redirect URIs du client

### Email non reçu
- Testez la connexion SMTP dans Realm Settings → Email
- Vérifiez les logs Keycloak
- Vérifiez le dossier spam

### Google OAuth ne fonctionne pas
- Vérifiez que l'URL de redirection est exactement celle configurée dans Google Cloud
- Vérifiez que le Client ID et Secret sont corrects
- Vérifiez les logs Keycloak pour plus de détails
- Assurez-vous que l'API Google+ est activée

### Erreur CORS
- Ajoutez l'origine dans Web Origins du client
- Vérifiez la configuration CORS dans le backend

## 10. Production

Pour la production, n'oubliez pas de:

- ✅ Utiliser HTTPS partout
- ✅ Changer tous les secrets (NEXTAUTH_SECRET, Client Secrets)
- ✅ Configurer les bons domaines dans Keycloak
- ✅ Activer la vérification d'email obligatoire
- ✅ Configurer un serveur SMTP professionnel
- ✅ Activer SSL/TLS pour Keycloak
- ✅ Mettre en place une stratégie de backup Keycloak
- ✅ Configurer les logs et monitoring
- ✅ Limiter les tentatives de connexion (brute force protection)

## Ressources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js](https://next-auth.js.org/)
