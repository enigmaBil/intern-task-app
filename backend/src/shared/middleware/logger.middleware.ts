import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour logger les requêtes HTTP
 * 
 * Enregistre les informations sur chaque requête HTTP entrante
 * et la durée de traitement.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = (req as any).requestId || 'N/A';

    // Timestamp de début
    const startTime = Date.now();

    this.logger.log(
      `[${requestId}] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Hook sur la fin de la réponse
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`,
      );
    });

    next();
  }
}
