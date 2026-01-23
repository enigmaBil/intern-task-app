# Changelog

## [Non publié] - 2026-01-23

### Ajouté

#### Page de Connexion Améliorée
- **Connexion avec Google**: Nouveau bouton permettant l'authentification via Google OAuth2, géré par Keycloak
- **Lien d'inscription**: Ajout d'un lien "S'inscrire" qui redirige vers la page d'inscription Keycloak
- **Récupération du mot de passe**: Lien "Mot de passe oublié ?" pour réinitialiser le mot de passe via Keycloak
- **Icône Google officielle**: Intégration de l'icône Google multicolore dans le bouton de connexion
- **Séparateur visuel**: Ajout d'un séparateur "Ou continuer avec" pour une meilleure UX
- **Documentation complète**: Création de fichiers README et DESIGN pour documenter les fonctionnalités

#### Configuration
- **Variables d'environnement**: Ajout des variables nécessaires dans `.env.example`:
  - `NEXT_PUBLIC_KEYCLOAK_URL`: URL publique Keycloak
  - `NEXT_PUBLIC_KEYCLOAK_REALM`: Nom du realm
  - `NEXT_PUBLIC_CLIENT_ID`: ID du client frontend
- **Guide de configuration Keycloak**: Document complet (`docs/KEYCLOAK_SETUP.md`) expliquant:
  - Configuration de Google OAuth dans Keycloak
  - Configuration du serveur email (SMTP)
  - Activation de l'inscription utilisateur
  - Configuration de la récupération de mot de passe
  - Mappage des attributs utilisateur
  - Tests et dépannage

#### Documentation
- `/frontend/src/app/login/README.md`: Documentation technique de la page de connexion
- `/frontend/src/app/login/DESIGN.md`: Spécifications de design et flux utilisateur
- `/docs/KEYCLOAK_SETUP.md`: Guide complet de configuration Keycloak

### Modifié

#### Frontend
- `/frontend/src/app/login/page.tsx`:
  - Ajout du composant Link de Next.js
  - Ajout des variables d'environnement pour construire les URLs Keycloak
  - Ajout de la fonction `handleGoogleLogin()` pour la connexion Google
  - Amélioration du layout avec le nouveau bouton Google et les liens
  - Ajout du label "Mot de passe oublié ?" avec lien

### Technique

#### Architecture
- Toute l'authentification reste gérée par Keycloak (zero-knowledge frontend)
- Les URLs de redirection sont construites dynamiquement côté client
- Support du paramètre `kc_idp_hint=google` pour forcer l'authentification Google
- Respect de l'architecture Clean (séparation des couches)

#### Sécurité
- Pas de stockage de credentials côté frontend
- Utilisation du flux OAuth2/OIDC standard
- Validation des tokens par Keycloak
- Support HTTPS recommandé en production

#### Compatibilité
- Responsive design (mobile, tablette, desktop)
- Accessibilité WCAG AA
- Support des navigateurs modernes
- Compatible avec Keycloak 20+

### À faire (Prochaines étapes)

- [ ] Configurer Google OAuth dans Keycloak (suivre `docs/KEYCLOAK_SETUP.md`)
- [ ] Configurer le serveur SMTP pour les emails
- [ ] Tester le flux complet d'inscription
- [ ] Tester la récupération de mot de passe
- [ ] Tester la connexion avec Google
- [ ] Ajouter des tests end-to-end pour l'authentification
- [ ] Implémenter l'authentification à deux facteurs (2FA) - optionnel
- [ ] Ajouter d'autres providers OAuth (GitHub, Microsoft) - optionnel

### Notes de migration

Si vous mettez à jour depuis une version précédente:

1. **Mettre à jour les variables d'environnement**:
   ```bash
   # Ajouter dans votre fichier .env
   NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   NEXT_PUBLIC_KEYCLOAK_REALM=Mini-Jira-Realm
   NEXT_PUBLIC_CLIENT_ID=mini-jira-frontend
   ```

2. **Configurer Keycloak**:
   - Suivre le guide dans `docs/KEYCLOAK_SETUP.md`
   - Activer l'inscription utilisateur
   - Configurer Google OAuth (optionnel)
   - Configurer le serveur email

3. **Tester les nouvelles fonctionnalités**:
   - Tester le lien d'inscription
   - Tester la récupération de mot de passe
   - Tester la connexion avec Google (si configuré)

### Problèmes connus

- La connexion Google nécessite une configuration dans Keycloak ET dans Google Cloud Console
- Le serveur email doit être configuré pour que la récupération de mot de passe fonctionne
- En développement local, utiliser `http://localhost:8080` pour Keycloak, pas `http://keycloak:8080`

### Contributeurs

- Configuration et intégration Keycloak
- Design de l'interface de connexion
- Documentation technique
