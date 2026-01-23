import { IUserRepository } from '@/core/domain/repositories/user.repository.interface';

/**
 * Use Case: Sync Users with Keycloak
 */
export class SyncUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<{ total: number; active: number; deactivated: number }> {
    return this.userRepository.sync();
  }
}
