import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Format de réponse standardisé
 */
export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Intercepteur pour transformer les réponses
 * 
 * Enveloppe toutes les réponses dans un format standardisé
 * pour assurer la cohérence de l'API.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
