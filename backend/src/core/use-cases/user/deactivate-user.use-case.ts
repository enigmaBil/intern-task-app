import { User } from "@/core/domain/entities/user.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Désactiver un utilisateur
 * 
 * Règles métier :
 * - Passe isActive à false au lieu de supprimer
 * - Seul un ADMIN peut désactiver un utilisateur
 */
export class DeactivateUserUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userInteractor.findById(userId);
    
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Désactiver l'utilisateur via l'interactor
    await this.userInteractor.deactivateUser(userId);
  }
}
