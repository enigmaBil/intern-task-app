import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundException';
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
