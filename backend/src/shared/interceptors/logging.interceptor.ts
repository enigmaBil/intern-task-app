import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepteur pour logger les requêtes et réponses
 * 
 * Enregistre les détails de chaque requête et le temps d'exécution.
 * Utile pour le monitoring et le débogage.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const requestId = request.requestId || 'N/A';
    const now = Date.now();

    // Log de la requête entrante
    this.logger.debug(
      `[${requestId}] Incoming Request: ${method} ${url}`,
    );

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`[${requestId}] Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = Date.now() - now;
          this.logger.debug(
            `[${requestId}] Response sent: ${method} ${url} - Duration: ${duration}ms`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${requestId}] Request failed: ${method} ${url} - Duration: ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
