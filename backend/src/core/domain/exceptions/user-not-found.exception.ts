/**
 * Exception levée lorsqu'un utilisateur n'est pas trouvé
 */
export class UserNotFoundException extends Error {
  public readonly userId: string;

  constructor(userId: string) {
    super(`User with id "${userId}" not found`);
    this.name = 'UserNotFoundException';
    this.userId = userId;
    
    Object.setPrototypeOf(this, UserNotFoundException.prototype);
  }
}