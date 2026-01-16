import { Prisma } from '@/infrastructure/generated/prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base Database Exception
 */
export class DatabaseException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, status);
  }
}

/**
 * Record Not Found Exception
 * Thrown when a database record is not found
 */
export class RecordNotFoundException extends DatabaseException {
  constructor(model: string, identifier: string) {
    super(`${model} with identifier '${identifier}' not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Unique Constraint Violation Exception
 * Thrown when trying to create/update a record that violates a unique constraint
 */
export class UniqueConstraintViolationException extends DatabaseException {
  constructor(field: string) {
    super(`A record with this ${field} already exists`, HttpStatus.CONFLICT);
  }
}

/**
 * Foreign Key Constraint Violation Exception
 * Thrown when trying to create/update/delete a record that violates a foreign key constraint
 */
export class ForeignKeyConstraintViolationException extends DatabaseException {
  constructor(message?: string) {
    super(
      message || 'Cannot perform operation due to related records',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Database Connection Exception
 * Thrown when there's a problem connecting to the database
 */
export class DatabaseConnectionException extends DatabaseException {
  constructor(message?: string) {
    super(
      message || 'Failed to connect to the database',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Handle Prisma Errors and convert them to appropriate exceptions
 */
export function handlePrismaError(error: any): never {
  // Prisma Client Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[];
        throw new UniqueConstraintViolationException(
          field ? field[0] : 'field',
        );

      case 'P2025':
        // Record not found
        throw new RecordNotFoundException('Record', 'unknown');

      case 'P2003':
        // Foreign key constraint violation
        throw new ForeignKeyConstraintViolationException();

      case 'P2014':
        // Relation violation
        throw new ForeignKeyConstraintViolationException(
          'The change you are trying to make would violate a required relation',
        );

      default:
        throw new DatabaseException(
          `Database error: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  // Prisma Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseException(
      'Invalid data provided to database',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Prisma Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new DatabaseConnectionException(error.message);
  }

  // Generic error
  throw new DatabaseException(
    error.message || 'An unexpected database error occurred',
  );
}

/**
 * Decorator to handle Prisma errors automatically
 */
export function HandlePrismaErrors() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        handlePrismaError(error);
      }
    };

    return descriptor;
  };
}
