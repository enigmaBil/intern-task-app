import { API_CONFIG } from '@/shared/constants';

export interface SyncUserInput {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

/**
 * Synchronise l'utilisateur courant avec le backend
 * Appelé automatiquement après chaque connexion OAuth
 * N'utilise pas httpClient car l'utilisateur n'est pas encore authentifié backend
 */
export async function syncCurrentUser(input: SyncUserInput): Promise<void> {
  try {
    console.log('[SyncUser] Synchronizing user with backend:', {
      email: input.email,
      keycloakId: input.keycloakId,
      roles: input.roles,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/sync-me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sync failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    console.log('[SyncUser] User synchronized successfully');
  } catch (error: any) {
    console.error('[SyncUser] Failed to sync user:', {
      error: error.message,
    });
    // Ne pas bloquer la connexion si la sync échoue
    // L'utilisateur sera synchronisé lors du prochain appel API protégé
  }
}
