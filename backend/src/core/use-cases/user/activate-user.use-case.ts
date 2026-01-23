import { User } from "@/core/domain/entities/user.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Activer un utilisateur
 * 
 * Règles métier :
 * - Passe isActive à true
 * - Seul un ADMIN peut activer un utilisateur
 */
export class ActivateUserUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userInteractor.findById(userId);
    
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Activer l'utilisateur via l'interactor
    await this.userInteractor.activateUser(userId);
  }
}
