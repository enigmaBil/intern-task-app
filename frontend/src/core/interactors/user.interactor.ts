import { UserRepository } from '@/infrastructure/repositories';
import {
  CreateUserUseCase,
  GetAllUsersUseCase,
  GetUserByIdUseCase,
} from '../use-cases/user';

export class UserInteractor {
  private userRepository: UserRepository;
  
  // Use cases
  public readonly createUser: CreateUserUseCase;
  public readonly getAllUsers: GetAllUsersUseCase;
  public readonly getUserById: GetUserByIdUseCase;

  constructor() {
    this.userRepository = new UserRepository();
    
    // Initialize use cases
    this.createUser = new CreateUserUseCase(this.userRepository);
    this.getAllUsers = new GetAllUsersUseCase(this.userRepository);
    this.getUserById = new GetUserByIdUseCase(this.userRepository);
  }
}

// Singleton instance
export const userInteractor = new UserInteractor();
