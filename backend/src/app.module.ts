import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './presentation/user/user.module';
import { TaskModule } from './presentation/task/task.module';
import { ScrumNoteModule } from './presentation/scrum-note/scrum-note.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Configuration du Throttling (Rate Limiting)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // Time to live : 60 secondes (fenêtre de temps)
        limit: 100, // Limite : 100 requêtes par fenêtre de 60 secondes
      },
      {
        name: 'strict',
        ttl: 60000, // 60 secondes
        limit: 10, // 10 requêtes / minute (pour endpoints sensibles)
      },
    ]),
    DatabaseModule,
    AuthModule,
    // Presentation Layer Modules
    UserModule,
    TaskModule,
    ScrumNoteModule,
  ],
  controllers: [],
  providers: [
    // Activer le ThrottleGuard globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*'); // Appliquer à toutes les routes
  }
}
