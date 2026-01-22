export const keycloakConfig = () => {
    // KC_URL est utilisé pour les appels internes (JWKS) - depuis Docker c'est http://keycloak:8080
    const kcUrl = process.env.KC_URL || process.env.KC_URL_PUBLIC || 'http://localhost:8080';
    
    const realm = process.env.KC_REALM || process.env.APP_REALM_NAME || 'Mini-Jira-Realm';
    
    return {
        keycloak: {
            url: kcUrl,
            realm: realm,
            clientId: process.env.KC_CLIENT_ID || process.env.BACKEND_CLIENT_ID || 'mini-jira-backend',
            clientSecret: process.env.KC_CLIENT_SECRET || process.env.BACKEND_CLIENT_SECRET || '',
            // L'issuer doit correspondre à celui dans le token JWT (URL interne dans Docker)
            issuer: `${kcUrl}/realms/${realm}`,
            // Le JWKS URI utilise l'URL interne pour récupérer les clés
            jwksUri: `${kcUrl}/realms/${realm}/protocol/openid-connect/certs`,
        },
        database: {
            url: process.env.DATABASE_URL,
        },
        app: {
            port: parseInt(process.env.BACKEND_PORT || '3001', 10),
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
    };
};

export type KeycloakConfig = ReturnType<typeof keycloakConfig>;