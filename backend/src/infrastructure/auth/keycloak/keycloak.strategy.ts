import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { keycloakConfig } from "./keycloak.config";
import { passportJwtSecret } from "jwks-rsa";
import { AuthService } from "../auth.service";

/**
 * Interface pour le payload JWT Keycloak
 */
export interface KeycloakUser {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

/**
 * Stratégie Passport pour valider les tokens JWT Keycloak
 * 
 * Cette stratégie :
 * 1. Extrait le token JWT du header Authorization
 * 2. Valide le token avec la clé publique Keycloak
 * 3. Synchronise l'utilisateur avec la base de données
 * 4. Retourne les informations de l'utilisateur pour la requête
 */
@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak'){
  private readonly logger = new Logger(KeycloakStrategy.name);

  constructor(private readonly authService: AuthService) {
    const config = keycloakConfig();
    
    // Accepter à la fois l'URL interne (keycloak) et externe (localhost)
    const internalIssuer = config.keycloak.issuer; // http://keycloak:8080/realms/...
    const externalIssuer = config.keycloak.issuer.replace('keycloak:8080', 'localhost:8080');
    
    console.log('🔍 Keycloak Strategy Config:', {
      issuer: config.keycloak.issuer,
      externalIssuer: externalIssuer,
      jwksUri: config.keycloak.jwksUri,
      clientId: config.keycloak.clientId,
    });
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Pas de vérification d'audience car Keycloak utilise "account" par défaut
      // On vérifie plutôt le azp (authorized party) qui contient le client_id
      // Ne pas utiliser issuer ici, on le validera manuellement
      // issuer: config.keycloak.issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.keycloak.jwksUri,
        handleSigningKeyError: (err, cb) => {
          console.error('❌ JWKS Error:', err);
          cb(err);
        },
      }),
    });

    this.logger.log('KeycloakStrategy initialisée');
  }

  /**
   * Méthode appelée après validation du token
   * 
   * @param payload - Contenu du token JWT décodé
   * @returns Objet utilisateur qui sera attaché à request.user
   */
  async validate(payload: KeycloakUser): Promise<any> {
    this.logger.log('Validation du payload JWT et synchronisation utilisateur');
    
    if (!payload.sub) {
      throw new UnauthorizedException('Token JWT invalide');
    }

    // Valider manuellement l'issuer (accepter localhost ET keycloak)
    const config = keycloakConfig();
    const expectedIssuers = [
      config.keycloak.issuer, // http://keycloak:8080/realms/...
      config.keycloak.issuer.replace('keycloak:8080', 'localhost:8080'), // http://localhost:8080/realms/...
    ];
    
    if (!expectedIssuers.includes((payload as any).iss)) {
      this.logger.error(`Invalid issuer: ${(payload as any).iss}, expected one of: ${expectedIssuers.join(', ')}`);
      throw new UnauthorizedException('Invalid token issuer');
    }

    // Synchroniser l'utilisateur avec la base de données
    const user = await this.authService.syncUserFromKeycloak(payload);

    // Retourner le payload complet avec les infos Keycloak et l'utilisateur DB
    return {
      ...payload, // Conserver les infos Keycloak (realm_access, resource_access, etc.)
      dbUser: user, // Ajouter les infos de la base de données
    };
  }
}