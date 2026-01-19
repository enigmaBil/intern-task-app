import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Intercepteur pour gérer les timeouts des requêtes
 * 
 * Annule automatiquement les requêtes qui prennent trop de temps
 * et retourne une RequestTimeoutException.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.timeoutMs = timeoutMs;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException('Request timeout exceeded'),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
