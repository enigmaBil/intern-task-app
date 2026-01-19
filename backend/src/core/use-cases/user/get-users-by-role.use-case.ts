import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { IUserInteractor } from "@/core/interactors/user.interactor";

/**
 * Use Case : Récupérer tous les utilisateurs d'un certain rôle
 * 
 * Utile pour :
 * - Lister tous les admins
 * - Lister tous les stagiaires pour assignation
 */
export class GetUsersByRoleUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(role: UserRole): Promise<User[]> {
    return this.userInteractor.findByRole(role);
  }
}