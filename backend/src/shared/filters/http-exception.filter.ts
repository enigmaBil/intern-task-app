import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre pour intercepter les exceptions HTTP de NestJS
 * 
 * Ce filtre capture les HttpException (exceptions NestJS natives)
 * et formate la réponse de manière cohérente.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception.name;
    } else {
      const res = exceptionResponse as any;
      message = res.message || exception.message;
      error = res.error || exception.name;
    }

    this.logger.warn(
      `HTTP Exception: ${status} - ${error} - ${request.method} ${request.url}`,
    );

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
