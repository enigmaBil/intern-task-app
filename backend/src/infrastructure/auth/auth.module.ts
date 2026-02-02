import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak/keycloak.strategy';
import { AuthService } from './auth.service';
import { SSEAuthGuard } from './guards/sse-auth.guard';
import { SyncUserFromAuthUseCase } from '@/core/use-cases/user';
import { DatabaseModule } from '../database/database.module';

/**
 * Module d'authentification
 * 
 * Gère :
 * - La stratégie Keycloak pour la validation JWT
 * - La synchronisation automatique des utilisateurs
 * - Les guards d'authentification
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'keycloak' }),
    DatabaseModule, // Pour accéder au UserRepository
  ],
  providers: [
    // Stratégie Keycloak
    KeycloakStrategy,
    
    // Service d'authentification
    AuthService,
    
    // Guard SSE pour les notifications temps réel
    SSEAuthGuard,
    
    // Use Case de synchronisation
    {
      provide: SyncUserFromAuthUseCase,
      useFactory: (userInteractor) => {
        return new SyncUserFromAuthUseCase(userInteractor);
      },
      inject: ['IUserInteractor'],
    },
  ],
  exports: [AuthService, PassportModule, SSEAuthGuard],
})
export class AuthModule {}
