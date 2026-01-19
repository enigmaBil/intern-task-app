import { User } from "@/core/domain/entities/user.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer un utilisateur par son ID
 */
export class GetUserByIdUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userInteractor.findById(userId);
    
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }
}