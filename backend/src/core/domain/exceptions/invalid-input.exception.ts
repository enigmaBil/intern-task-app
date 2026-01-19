/**
 * Exception levée lors d'une validation d'input invalide
 */
export class InvalidInputException extends Error {
  public readonly fieldName: string;
  public readonly reason: string;

  constructor(fieldName: string, reason: string) {
    super(`Invalid input for field "${fieldName}": ${reason}`);
    this.name = 'InvalidInputException';
    this.fieldName = fieldName;
    this.reason = reason;
    
    Object.setPrototypeOf(this, InvalidInputException.prototype);
  }
}
