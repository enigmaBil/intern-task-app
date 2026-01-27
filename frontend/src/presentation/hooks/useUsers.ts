'use client';

import { useQuery } from '@tanstack/react-query';
import { userInteractor } from '@/core/interactors';

/**
 * Hook React Query pour gérer les utilisateurs avec cache intelligent
 * 
 * Avantages de React Query:
 * - Cache automatique: évite les requêtes duplicates
 * - Partage de données: tous les composants partagent le même cache
 * - Refetch intelligent: mise à jour en arrière-plan
 * - Optimisation performance: moins de requêtes réseau
 */
export function useUsers() {
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'], // Clé unique pour identifier cette requête
    queryFn: async () => {
      return await userInteractor.getAllUsers.execute();
    },
    staleTime: 5 * 60 * 1000, // Données fraîches pendant 5 minutes
    gcTime: 10 * 60 * 1000, // Cache gardé 10 minutes
  });

  return {
    users,
    isLoading,
    error: error ? 'Erreur lors du chargement des utilisateurs' : null,
    refetch,
  };
}
