import { IUserRepository } from '@/core/domain/repositories';
import { User } from '@/core/domain/entities';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
