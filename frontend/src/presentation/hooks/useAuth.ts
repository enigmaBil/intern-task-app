'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { AuthUser } from '@/core/domain/services';

/**
 * Hook personnalisé pour accéder à la session Keycloak
 * Respecte l'architecture Clean en exposant les types du domaine
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const login = async (credentials: { email: string; password: string }) => {
    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Email ou mot de passe incorrect');
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id,
        email: (session.user as any).email || '',
        firstName: (session.user as any).firstName || '',
        lastName: (session.user as any).lastName || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'INTERN',
        accessToken: (session as any).accessToken,
      }
    : null;

  return {
    user,
    session,
    accessToken: (session as any)?.accessToken as string | undefined,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',
    login,
    logout,
    hasRole: (role: 'ADMIN' | 'INTERN') => {
      return user?.role === role;
    },
    isAdmin: () => user?.role === 'ADMIN',
    isIntern: () => user?.role === 'INTERN',
  };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useHasRole(role: 'ADMIN' | 'INTERN'): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

/**
 * Hook pour vérifier si l'utilisateur est admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin();
}

/**
 * Hook pour vérifier si l'utilisateur est intern
 */
export function useIsIntern(): boolean {
  const { isIntern } = useAuth();
  return isIntern();
}
