import { IUserRepository, CreateUserDto } from '@/core/domain/repositories';
import { User } from '@/core/domain/entities';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    return await this.userRepository.create(data);
  }
}
