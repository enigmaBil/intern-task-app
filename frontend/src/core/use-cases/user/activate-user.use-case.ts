import { IUserRepository } from '@/core/domain/repositories/user.repository.interface';

/**
 * Use Case: Activate User
 */
export class ActivateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    return this.userRepository.activate(userId);
  }
}
