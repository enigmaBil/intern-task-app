import { User } from "@/core/domain/entities/user.entity";
import { IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer tous les utilisateurs
 * 
 */
export class GetAllUsersUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(): Promise<User[]> {
    return this.userInteractor.findAll();
  }
}