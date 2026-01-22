export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DomainException';
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}
