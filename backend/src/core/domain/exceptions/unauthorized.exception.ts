/**
 * Exception levée lorsqu'un utilisateur n'a pas les permissions
 * nécessaires pour effectuer une action
 */
export class UnauthorizedException extends Error {
  public readonly userId: string;
  public readonly action: string;

  constructor(userId: string, action: string) {
    super(`User "${userId}" is not authorized to perform action: ${action}`);
    this.name = 'UnauthorizedException';
    this.userId = userId;
    this.action = action;
    
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}