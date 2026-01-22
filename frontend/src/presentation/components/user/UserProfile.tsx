'use client';

import { useAuth } from '@/presentation/hooks';
import { LoadingSpinner } from '@/presentation/components/shared';

/**
 * Composant d'affichage du profil utilisateur avec Keycloak
 * Affiche les informations de l'utilisateur connecté via Keycloak
 */
export function UserProfile() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500">{user.email}</p>
        <p className="text-xs text-blue-600 font-medium">{user.role}</p>
      </div>
      
      <button
        onClick={logout}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Déconnexion
      </button>
    </div>
  );
}
