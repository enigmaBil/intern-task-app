import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedException';
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}
