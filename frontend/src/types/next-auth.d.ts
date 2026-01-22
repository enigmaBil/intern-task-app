import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

/**
 * Extension des types NextAuth pour supporter Keycloak
 * Ces déclarations étendent les types par défaut de NextAuth
 */

declare module 'next-auth' {
  /**
   * Extension de l'interface Session
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'INTERN';
      image?: string | null;
    };
    accessToken?: string;
    error?: string;
  }

  /**
   * Extension de l'interface User
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INTERN';
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
  }

  /**
   * Extension du Profile Keycloak
   */
  interface Profile {
    sub: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    realm_access?: {
      roles: string[];
    };
    resource_access?: {
      [key: string]: {
        roles: string[];
      };
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extension de l'interface JWT Token
   */
  interface JWT extends DefaultJWT {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

export {};
