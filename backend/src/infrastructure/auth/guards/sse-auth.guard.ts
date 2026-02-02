import { Injectable, Logger, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserInteractor } from '@/core/interactors';
import { keycloakConfig } from '../keycloak/keycloak.config';
import { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

/**
 * Guard pour les endpoints SSE
 * 
 * Supporte l'authentification via:
 * - Header Authorization: Bearer <token>
 * - Query parameter: ?token=<token>
 * 
 * Ceci est nécessaire car EventSource ne supporte pas les headers personnalisés.
 */
@Injectable()
export class SSEAuthGuard implements CanActivate {
  private readonly logger = new Logger(SSEAuthGuard.name);
  private readonly config = keycloakConfig();
  private readonly jwksClient: JwksClient;

  constructor(
    @Inject('IUserInteractor') private readonly userInteractor: IUserInteractor,
  ) {
    // Utiliser JwksClient directement pour récupérer les clés publiques
    this.logger.log(`Initializing SSEAuthGuard with JWKS URI: ${this.config.keycloak.jwksUri}`);
    this.jwksClient = new JwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: this.config.keycloak.jwksUri,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Essayer d'obtenir le token depuis le header
    let token = this.extractTokenFromHeader(request);

    // Si pas de token dans le header, essayer le query parameter
    if (!token) {
      token = request.query?.token;
    }

    if (!token) {
      this.logger.warn('SSE connection attempt without token');
      throw new UnauthorizedException('Token required for SSE connection');
    }

    try {
      // Décoder le token pour obtenir le header (kid)
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || typeof decoded === 'string' || !decoded.header) {
        throw new UnauthorizedException('Invalid token format');
      }

      this.logger.debug(`Token kid: ${decoded.header.kid}, alg: ${decoded.header.alg}`);

      // Obtenir la clé de signature via JWKS
      const signingKey = await this.getSigningKey(decoded.header.kid!);
      
      this.logger.debug('Successfully retrieved signing key from JWKS');

      // Valider le token
      const payload = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
      }) as any;

      // Valider l'issuer (accepter localhost ET keycloak)
      const expectedIssuers = [
        this.config.keycloak.issuer,
        this.config.keycloak.issuer.replace('keycloak:8080', 'localhost:8080'),
      ];
      
      if (!expectedIssuers.includes(payload.iss)) {
        this.logger.error(`Invalid issuer: ${payload.iss}`);
        throw new UnauthorizedException('Invalid token issuer');
      }

      // Récupérer l'utilisateur depuis la base de données
      const user = await this.userInteractor.findByEmail(payload.email);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attacher l'utilisateur à la requête (format compatible avec KeycloakStrategy)
      request.user = {
        ...payload,
        dbUser: user,
      };
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('SSE auth failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getSigningKey(kid: string): Promise<string> {
    try {
      const signingKey = await this.jwksClient.getSigningKey(kid);
      return signingKey.getPublicKey();
    } catch (error) {
      this.logger.error(`Error getting signing key for kid ${kid}:`, error);
      throw error;
    }
  }
}
