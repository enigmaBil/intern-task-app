# Guide de démarrage rapide - Authentification

Ce guide vous aide à démarrer rapidement avec les nouvelles fonctionnalités d'authentification.

## 🚀 Démarrage rapide (Mode basique)

Si vous voulez juste tester l'authentification email/password:

1. **Démarrer les services**:
   ```bash
   docker-compose up -d
   ```

2. **Accéder à Keycloak**:
   - URL: http://localhost:8080
   - Login: admin / admin (par défaut)

3. **Activer l'inscription** (si pas déjà fait):
   - Sélectionner le realm "Mini-Jira-Realm"
   - Realm Settings → Login → Activer "User registration"
   - Sauvegarder

4. **Tester**:
   - Aller sur http://localhost:3000/login
   - Cliquer sur "S'inscrire"
   - Créer un compte
   - Se connecter avec le nouveau compte

✅ Fonctionnalités disponibles:
- ✅ Connexion email/password
- ✅ Inscription
- ⚠️ Récupération mot de passe (nécessite configuration email)
- ❌ Connexion Google (nécessite configuration)

## 🎯 Configuration complète (avec email et Google)

Pour activer toutes les fonctionnalités:

### Étape 1: Configuration Email

1. **Obtenir des credentials SMTP**:
   - Gmail: Créer un App Password
   - Ou utiliser SendGrid, Mailgun, etc.

2. **Configurer dans Keycloak**:
   - Realm Settings → Email
   - Remplir les informations SMTP
   - Tester la connexion

### Étape 2: Configuration Google OAuth

1. **Google Cloud Console**:
   ```
   1. Créer un projet
   2. Activer l'API Google+
   3. Créer un Client ID OAuth 2.0
   4. Ajouter l'URI de redirection:
      http://localhost:8080/realms/Mini-Jira-Realm/broker/google/endpoint
   ```

2. **Configurer dans Keycloak**:
   ```
   1. Identity Providers → Add provider → Google
   2. Ajouter Client ID et Client Secret
   3. Activer "Trust Email"
   4. Sauvegarder
   ```

3. **Mapper les attributs**:
   ```
   - email → email
   - given_name → firstName
   - family_name → lastName
   ```

### Étape 3: Variables d'environnement

Créer un fichier `.env` à la racine:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-change-in-production

# Keycloak Public
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=Mini-Jira-Realm
NEXT_PUBLIC_CLIENT_ID=mini-jira-frontend

# Keycloak Internal
KEYCLOAK_ISSUER=http://keycloak:8080/realms/Mini-Jira-Realm
FRONTEND_CLIENT_ID=mini-jira-frontend
FRONTEND_CLIENT_SECRET=your-keycloak-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Étape 4: Redémarrer

```bash
docker-compose down
docker-compose up -d
```

## 📋 Checklist de configuration

### Configuration minimale (email/password uniquement)
- [ ] Docker Compose démarré
- [ ] Keycloak accessible (localhost:8080)
- [ ] Realm "Mini-Jira-Realm" existe
- [ ] Client "mini-jira-frontend" configuré
- [ ] User registration activé

### Configuration complète
- [ ] Configuration email SMTP testée
- [ ] Google OAuth configuré dans Google Cloud
- [ ] Google Identity Provider ajouté dans Keycloak
- [ ] Mappers d'attributs configurés
- [ ] Variables d'environnement à jour
- [ ] Services redémarrés

## 🧪 Tests

### Test 1: Inscription
```
1. Aller sur http://localhost:3000/login
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire Keycloak
4. Soumettre
5. ✅ Vous devriez être redirigé vers la page de login
```

### Test 2: Connexion email/password
```
1. Aller sur http://localhost:3000/login
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"
4. ✅ Vous devriez être redirigé vers /dashboard
```

### Test 3: Mot de passe oublié
```
1. Aller sur http://localhost:3000/login
2. Cliquer sur "Mot de passe oublié ?"
3. Entrer votre email
4. ✅ Vous devriez recevoir un email (si SMTP configuré)
5. Cliquer sur le lien dans l'email
6. Réinitialiser le mot de passe
7. ✅ Se connecter avec le nouveau mot de passe
```

### Test 4: Connexion Google
```
1. Aller sur http://localhost:3000/login
2. Cliquer sur "Continuer avec Google"
3. ✅ Redirection vers Google
4. S'authentifier avec Google
5. ✅ Redirection vers /dashboard
6. ✅ Compte créé automatiquement dans Keycloak
```

## 🐛 Dépannage

### Problème: "L'inscription ne fonctionne pas"
**Solution**:
- Vérifier que "User registration" est activé dans Keycloak
- Vérifier les Redirect URIs du client

### Problème: "Pas d'email reçu"
**Solution**:
- Tester la connexion SMTP dans Keycloak
- Vérifier les logs Keycloak: `docker-compose logs keycloak`
- Vérifier le dossier spam

### Problème: "Google OAuth ne fonctionne pas"
**Solution**:
- Vérifier l'URL de redirection dans Google Cloud Console
- Vérifier que le Client ID et Secret sont corrects
- Vérifier que l'API Google+ est activée
- Consulter les logs: `docker-compose logs keycloak`

### Problème: "Erreur CORS"
**Solution**:
- Ajouter l'origine dans "Web Origins" du client Keycloak
- Vérifier la configuration CORS du backend

### Problème: "window is not defined"
**Solution**:
- Les variables avec `window` doivent être dans un composant client
- Vérifier que 'use client' est en haut du fichier

## 📚 Ressources

- [Documentation complète Keycloak](./KEYCLOAK_SETUP.md)
- [Design de la page de connexion](../frontend/src/app/login/DESIGN.md)
- [README technique](../frontend/src/app/login/README.md)
- [Variables d'environnement](../.env.example)

## 🆘 Besoin d'aide ?

1. Consultez d'abord les logs:
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   docker-compose logs keycloak
   ```

2. Vérifiez la configuration Keycloak dans l'interface admin

3. Vérifiez que les variables d'environnement sont correctes

4. Consultez la documentation officielle:
   - [Keycloak Docs](https://www.keycloak.org/documentation)
   - [NextAuth Docs](https://next-auth.js.org/)

## 🎉 Prochaines étapes

Une fois l'authentification configurée:

1. **Créer des utilisateurs de test** avec différents rôles
2. **Configurer les permissions** dans Keycloak
3. **Tester les endpoints protégés** du backend
4. **Implémenter la gestion des rôles** dans l'UI
5. **Ajouter des tests automatisés** pour l'authentification

Bon développement ! 🚀
