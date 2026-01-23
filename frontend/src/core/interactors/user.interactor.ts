import { UserRepository } from '@/infrastructure/repositories';
import {
  CreateUserUseCase,
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  DeactivateUserUseCase,
  ActivateUserUseCase,
  SyncUsersUseCase,
} from '../use-cases/user';

export class UserInteractor {
  private userRepository: UserRepository;
  
  // Use cases
  public readonly createUser: CreateUserUseCase;
  public readonly getAllUsers: GetAllUsersUseCase;
  public readonly getUserById: GetUserByIdUseCase;
  public readonly deactivateUser: DeactivateUserUseCase;
  public readonly activateUser: ActivateUserUseCase;
  public readonly syncUsers: SyncUsersUseCase;

  constructor() {
    this.userRepository = new UserRepository();
    
    // Initialize use cases
    this.createUser = new CreateUserUseCase(this.userRepository);
    this.getAllUsers = new GetAllUsersUseCase(this.userRepository);
    this.getUserById = new GetUserByIdUseCase(this.userRepository);
    this.deactivateUser = new DeactivateUserUseCase(this.userRepository);
    this.activateUser = new ActivateUserUseCase(this.userRepository);
    this.syncUsers = new SyncUsersUseCase(this.userRepository);
  }
}

// Singleton instance
export const userInteractor = new UserInteractor();
