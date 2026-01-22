import { IUserRepository } from '@/core/domain/repositories';
import { User } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('User', id);
    }

    return user;
  }
}
