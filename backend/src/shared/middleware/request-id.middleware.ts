import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware pour générer un ID unique par requête
 * 
 * Ajoute un request-id à chaque requête pour faciliter le traçage
 * et le débogage dans les logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Récupérer le request-id du header ou en générer un nouveau
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Ajouter le request-id à la requête
    (req as any).requestId = requestId;

    // Ajouter le request-id au header de réponse
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
