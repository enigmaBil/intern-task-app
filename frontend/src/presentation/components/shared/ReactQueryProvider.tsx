'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Créer une instance unique de QueryClient par session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache les données pendant 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garde les données en cache pendant 10 minutes même si non utilisées
            gcTime: 10 * 60 * 1000,
            // Retry automatique en cas d'échec
            retry: 1,
            // Refetch automatique désactivé par défaut
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
