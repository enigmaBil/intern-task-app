import { IUserRepository } from '@/core/domain/repositories/user.repository.interface';

/**
 * Use Case: Deactivate User
 */
export class DeactivateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    return this.userRepository.deactivate(userId);
  }
}
