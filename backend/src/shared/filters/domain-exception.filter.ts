import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Filtre pour intercepter les exceptions du domaine
 * 
 * Ce filtre capture les exceptions métier (domaine) et les transforme
 * en réponses HTTP appropriées, tout en respectant la séparation
 * entre la couche domaine et la couche infrastructure.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Mapper les exceptions du domaine vers des codes HTTP
    const status = this.getHttpStatus(exception);
    const errorName = exception.name;
    const message = exception.message;

    this.logger.warn(
      `Domain Exception: ${errorName} - ${message} - Path: ${request.url}`,
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorName,
      message,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Détermine le code de statut HTTP approprié en fonction du type d'exception
   */
  private getHttpStatus(exception: Error): number {
    const exceptionName = exception.name;

    // NotFound exceptions -> 404
    if (exceptionName.includes('NotFound')) {
      return HttpStatus.NOT_FOUND;
    }

    // Unauthorized exceptions -> 403
    if (exceptionName.includes('Unauthorized')) {
      return HttpStatus.FORBIDDEN;
    }

    // InvalidInput, InvalidTransition exceptions -> 400
    if (exceptionName.includes('Invalid')) {
      return HttpStatus.BAD_REQUEST;
    }

    // NotAssignable, conflits -> 409
    if (exceptionName.includes('NotAssignable') || exceptionName.includes('Conflict')) {
      return HttpStatus.CONFLICT;
    }

    // Par défaut -> 500
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
