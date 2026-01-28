import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
 * Configuration NextAuth avec Credentials Provider et Keycloak Provider
 * Supporte à la fois email/password et connexion via Google
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        try {
          // URL interne pour appel serveur-à-serveur
          const keycloakIssuer =
            process.env.BACKEND_KEYCLOAK_ISSUER ||
            "http://keycloak:8080/realms/Mini-Jira-Realm";
          const tokenEndpoint = `${keycloakIssuer}/protocol/openid-connect/token`;

          console.log("[Auth] Attempting login:", {
            endpoint: tokenEndpoint,
            clientId: process.env.FRONTEND_CLIENT_ID || "mini-jira-frontend",
            username: credentials.email,
          });

          const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.FRONTEND_CLIENT_ID || "mini-jira-frontend",
              client_secret: process.env.FRONTEND_CLIENT_SECRET || "",
              grant_type: "password",
              username: credentials.email,
              password: credentials.password,
              scope: "openid email profile",
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error("[Auth] Keycloak error:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return null;
          }

          const tokens = await response.json();
          console.log("[Auth] Successfully obtained tokens from Keycloak");

          const accessToken = tokens.access_token;
          const payload = JSON.parse(atob(accessToken.split(".")[1]));

          console.log("[Auth] Token payload:", {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            roles: payload.realm_access?.roles,
          });

          const realmRoles = payload.realm_access?.roles || [];
          const clientRoles =
            payload.resource_access?.["mini-jira-frontend"]?.roles || [];
          const allRoles = [...realmRoles, ...clientRoles];

          const role = allRoles.includes("ADMIN") ? "ADMIN" : "INTERN";

          const user = {
            id: payload.sub,
            email: payload.email || credentials.email,
            name:
              payload.name ||
              `${payload.given_name || ""} ${payload.family_name || ""}`,
            firstName: payload.given_name || "",
            lastName: payload.family_name || "",
            role: role,
            roles: allRoles, // Tous les rôles pour sync backend
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            idToken: tokens.id_token,
            expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
          };

          console.log("[Auth] Returning user:", {
            id: user.id,
            email: user.email,
            role: user.role,
          });
          return user;
        } catch (error) {
          console.error("[Auth] Keycloak authentication error:", error);
          return null;
        }
      },
    }),

    KeycloakProvider({
      id: "keycloak-google",
      name: "Google",
      clientId: process.env.FRONTEND_CLIENT_ID || "mini-jira-frontend",
      clientSecret: process.env.FRONTEND_CLIENT_SECRET || "",

      // Configuration manuelle des endpoints
      wellKnown: undefined,
      issuer:
        process.env.KEYCLOAK_ISSUER ||
        "http://localhost:8080/realms/Mini-Jira-Realm",

      authorization: {
        // URL publique pour la redirection du navigateur
        url: `${process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/Mini-Jira-Realm"}/protocol/openid-connect/auth`,
        params: {
          scope: "openid email profile",
          kc_idp_hint: "google",
        },
      },

      token: {
        // URL interne pour l'échange de token (serveur-à-serveur)
        url: `${process.env.BACKEND_KEYCLOAK_ISSUER || "http://keycloak:8080/realms/Mini-Jira-Realm"}/protocol/openid-connect/token`,
      },

      userinfo: {
        // URL interne pour récupérer les infos utilisateur
        url: `${process.env.BACKEND_KEYCLOAK_ISSUER || "http://keycloak:8080/realms/Mini-Jira-Realm"}/protocol/openid-connect/userinfo`,
      },

      jwks_endpoint: `${process.env.BACKEND_KEYCLOAK_ISSUER || "http://keycloak:8080/realms/Mini-Jira-Realm"}/protocol/openid-connect/certs`,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // Log pour debug
      console.log("[Auth] JWT callback:", {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        trigger,
        provider: account?.provider,
      });

      // Connexion initiale avec Credentials Provider
      // Pour credentials, user est défini mais account peut être null ou avoir provider="credentials"
      if (user && (!account || account.provider === "credentials")) {
        console.log("[Auth] Processing credentials login...");
        
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.role = (user as any).role;
        token.roles = (user as any).roles || []; // Tous les rôles pour sync backend
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.expiresAt = (user as any).expiresAt;

        console.log(
          "[Auth] Initial login completed, token expires at:",
          new Date((token.expiresAt as number) * 1000),
        );
        console.log("[Auth] Token data:", {
          hasAccessToken: !!token.accessToken,
          hasRefreshToken: !!token.refreshToken,
          expiresAt: token.expiresAt,
          accessTokenLength: token.accessToken ? (token.accessToken as string).length : 0,
          refreshTokenLength: token.refreshToken ? (token.refreshToken as string).length : 0,
        });

        // Retourner directement le token lors de la première connexion
        return token;
      }

      // Connexion initiale avec Keycloak Provider (Google)
      if (account && account.provider === "keycloak-google" && profile) {
        console.log("[Auth] Processing Google login...");
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        token.id = profile.sub as string;
        token.email = profile.email;
        token.name = profile.name;
        token.firstName = (profile as any).given_name || "";
        token.lastName = (profile as any).family_name || "";

        const realmRoles = (profile as any).realm_access?.roles || [];
        const clientRoles =
          (profile as any).resource_access?.["mini-jira-frontend"]?.roles || [];
        const allRoles = [...realmRoles, ...clientRoles];

        // Stocker le rôle principal ET tous les rôles pour la synchronisation
        token.role = allRoles.includes("ADMIN") ? "ADMIN" : "INTERN";
        token.roles = allRoles; // Tous les rôles pour sync backend

        console.log("[Auth] Google login completed:", {
          expiresAt: new Date((token.expiresAt as number) * 1000),
          role: token.role,
          roles: token.roles,
          rolesCount: allRoles.length,
        });

        // Retourner directement le token lors de la première connexion
        return token;
      }

      // Si le token a déjà un accessToken, on continue avec les vérifications normales
      // (ceci gère les appels suivants après la connexion initiale)
      if (token.accessToken) {
        // Vérifier si le token est encore valide (avec une marge de 60 secondes)
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = token.expiresAt as number;

        console.log("[Auth] Token check:", {
          now,
          expiresAt,
          hasRefreshToken: !!token.refreshToken,
          hasAccessToken: !!token.accessToken,
        });

        if (expiresAt && now < expiresAt - 60) {
          // Token encore valide pour au moins 60 secondes
          console.log("[Auth] Token still valid");
          return token;
        }

        // Token expiré ou proche de l'expiration, le rafraîchir
        console.log("[Auth] Token expired or close to expiration, refreshing...");
        return await refreshAccessToken(token);
      }

      // Si on arrive ici, c'est qu'on n'a ni user, ni account, ni accessToken
      // Cela peut arriver lors du premier appel du callback JWT avant que authorize() ne retourne
      // Dans ce cas, on retourne le token tel quel et on attend le prochain appel
      console.log("[Auth] No accessToken yet, waiting for authorize() to complete...");
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth] Session callback:", {
        hasToken: !!token,
        hasAccessToken: !!token.accessToken,
        tokenId: token.id,
        role: token.role,
        roles: token.roles,
        error: token.error,
      });
      
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          role: token.role as string,
          roles: (token.roles as string[]) || [], // Exposer tous les rôles
          image: null,
        },
        accessToken: token.accessToken as string,
        error: token.error as string | undefined,
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  events: {
    async signOut({ token }) {
      // Pour Keycloak, on peut faire un logout avec le refresh token
      if (token.refreshToken) {
        const issuer =
          process.env.BACKEND_KEYCLOAK_ISSUER ||
          "http://keycloak:8080/realms/Mini-Jira-Realm";
        const logoutUrl = `${issuer}/protocol/openid-connect/logout`;

        try {
          await fetch(logoutUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.FRONTEND_CLIENT_ID || "mini-jira-frontend",
              client_secret: process.env.FRONTEND_CLIENT_SECRET || "",
              refresh_token: token.refreshToken as string,
            }),
          });
          console.log("[Auth] Successfully logged out from Keycloak");
        } catch (error) {
          console.error("[Auth] Keycloak logout error:", error);
        }
      }
    },
  },
};

/**
 * Rafraîchit le token d'accès en utilisant le refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    // Vérifier que le refresh token existe
    if (!token.refreshToken) {
      console.error("[Auth] No refresh token available");
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    // URL interne pour appel serveur-à-serveur
    const issuer =
      process.env.BACKEND_KEYCLOAK_ISSUER ||
      "http://keycloak:8080/realms/Mini-Jira-Realm";
    const tokenEndpoint = `${issuer}/protocol/openid-connect/token`;

    console.log("[Auth] Attempting to refresh token...");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.FRONTEND_CLIENT_ID || "mini-jira-frontend",
        client_secret: process.env.FRONTEND_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("[Auth] Token refresh failed:", refreshedTokens);
      throw refreshedTokens;
    }

    console.log(
      "[Auth] Token refreshed successfully, new expiration:",
      new Date(
        (Math.floor(Date.now() / 1000) + refreshedTokens.expires_in) * 1000,
      ),
    );

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      // Ne pas stocker idToken (trop gros pour le cookie)
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error("[Auth] Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
