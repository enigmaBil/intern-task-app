import { User } from "@/core/domain/entities/user.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IUserInteractor } from "@/core/interactors";

/**
 * Input pour récupérer un utilisateur
 */
export interface GetUserByIdInput {
  userId: string;
}

/**
 * Use Case : Récupérer un utilisateur par son ID
 */
export class GetUserByIdUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(input: GetUserByIdInput): Promise<User> {
    const user = await this.userInteractor.findById(input.userId);
    
    if (!user) {
      throw new UserNotFoundException(input.userId);
    }

    return user;
  }
}