'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { syncCurrentUser } from '@/infrastructure/auth/sync-user';

/**
 * Hook pour synchroniser automatiquement l'utilisateur connecté avec le backend
 * Doit être utilisé dans le layout principal de l'application
 */
export function useUserSync() {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Ne synchroniser qu'une seule fois par session
    if (status !== 'authenticated' || !session?.user || hasSynced.current) {
      return;
    }

    const user = session.user as any;

    // Extraire tous les rôles depuis le token (stockés dans session.user.roles si disponible)
    // Sinon, utiliser le rôle principal
    const roles = user.roles || (user.role ? [user.role] : []);

    // Préparer les données de synchronisation
    const syncData = {
      keycloakId: user.id,
      email: user.email,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      roles: roles,
    };

    // Marquer comme synchronisé avant l'appel pour éviter les doubles appels
    hasSynced.current = true;

    console.log('[useUserSync] Starting user synchronization:', {
      email: syncData.email,
      roles: syncData.roles,
    });

    // Lancer la synchronisation en arrière-plan
    syncCurrentUser(syncData).catch((error) => {
      console.error('[useUserSync] Sync failed:', error);
      // Réinitialiser pour réessayer plus tard si l'erreur est réseau
      hasSynced.current = false;
    });
  }, [status, session]);
}
