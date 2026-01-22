'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * Wrapper pour le SessionProvider de NextAuth
 * Permet l'utilisation côté client des hooks NextAuth (useSession, signIn, signOut)
 */
interface SessionProviderProps {
  children: ReactNode;
  session?: any;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
