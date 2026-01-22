import { 
  IAuthService, 
  AuthUser, 
  LoginCredentials, 
  RegisterData, 
  AuthTokens 
} from '@/core/domain/services';
import { signIn, signOut, getSession } from 'next-auth/react';

/**
 * Service d'authentification basé sur NextAuth et Keycloak
 * Respecte l'architecture Clean en implémentant IAuthService
 */
export class AuthService implements IAuthService {
  /**
   * Connexion via Keycloak
   * Note: avec Keycloak, on redirige vers la page de login Keycloak
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Avec Keycloak, on utilise le flow OAuth2/OIDC
    // On redirige vers la page de connexion Keycloak
    const result = await signIn('keycloak', {
      redirect: false,
      callbackUrl: '/dashboard',
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    // Récupérer la session après connexion
    const session = await getSession();
    if (!session?.user) {
      throw new Error('Failed to get session after login');
    }

    return session.user as AuthUser;
  }

  /**
   * Inscription - Non supportée directement avec Keycloak
   * L'inscription doit se faire via l'interface Keycloak
   */
  async register(data: RegisterData): Promise<AuthUser> {
    throw new Error('Registration is handled by Keycloak. Please register through Keycloak interface.');
  }

  /**
   * Déconnexion
   * Déconnecte l'utilisateur de NextAuth et de Keycloak
   */
  async logout(): Promise<void> {
    await signOut({
      redirect: true,
      callbackUrl: '/login',
    });
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const session = await getSession();
    return session?.user as AuthUser || null;
  }

  /**
   * Rafraîchit le token
   * Géré automatiquement par NextAuth dans les callbacks
   */
  async refreshToken(): Promise<AuthTokens> {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error('No access token to refresh');
    }

    return {
      accessToken: session.accessToken as string,
      refreshToken: undefined,
    };
  }

  /**
   * Récupère la session complète
   */
  async getSession(): Promise<any> {
    return await getSession();
  }
}

// Instance singleton
export const authService = new AuthService();

