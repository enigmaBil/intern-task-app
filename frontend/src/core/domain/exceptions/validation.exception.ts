import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
