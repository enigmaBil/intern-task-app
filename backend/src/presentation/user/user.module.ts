import { Module } from '@nestjs/common';
import { GetAllUsersUseCase } from '@/core/use-cases/user/get-all-users.use-case';
import { GetUserByIdUseCase } from '@/core/use-cases/user/get-user-by-id.use-case';
import { GetUsersByRoleUseCase } from '@/core/use-cases/user/get-users-by-role.use-case';
import { DeactivateUserUseCase } from '@/core/use-cases/user/deactivate-user.use-case';
import { ActivateUserUseCase } from '@/core/use-cases/user/activate-user.use-case';
import { SyncUsersWithKeycloakUseCase } from '@/core/use-cases/user/sync-users-with-keycloak.use-case';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { UserController } from './user.controller';

/**
 * Module de présentation pour les utilisateurs
 * 
 * Gère les endpoints HTTP pour les opérations sur les utilisateurs.
 * Injecte les use-cases et les repositories via DatabaseModule.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    // Use Cases
    {
      provide: GetAllUsersUseCase,
      useFactory: (userInteractor) => new GetAllUsersUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (userInteractor) => new GetUserByIdUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
    {
      provide: GetUsersByRoleUseCase,
      useFactory: (userInteractor) => new GetUsersByRoleUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
    {
      provide: DeactivateUserUseCase,
      useFactory: (userInteractor) => new DeactivateUserUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
    {
      provide: ActivateUserUseCase,
      useFactory: (userInteractor) => new ActivateUserUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
    {
      provide: SyncUsersWithKeycloakUseCase,
      useFactory: (userInteractor) => new SyncUsersWithKeycloakUseCase(userInteractor),
      inject: ['IUserInteractor'],
    },
  ],
  exports: [],
})
export class UserModule {}
