import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global pour intercepter toutes les exceptions
 * 
 * Ce filtre capture toutes les exceptions non gérées et
 * retourne une réponse HTTP formatée de manière cohérente.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    // Si c'est une HttpException (NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        error = res.error || error;
      }
    } 
    // Si c'est une erreur du domaine (nos exceptions métier)
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Mapper les exceptions du domaine vers des codes HTTP appropriés
      if (error.includes('NotFound')) {
        status = HttpStatus.NOT_FOUND;
      } else if (error.includes('Unauthorized')) {
        status = HttpStatus.FORBIDDEN;
      } else if (error.includes('InvalidInput')) {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    // Logger l'erreur
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${error} - Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Construire la réponse
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
