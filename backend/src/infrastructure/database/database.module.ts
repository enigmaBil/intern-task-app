import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { 
  PrismaScrumNoteRepository, 
  PrismaTaskRepository, 
  PrismaUserRepository,
  PrismaNotificationRepository,
} from './repositories';

/**
 * Module Database - Fournit l'accès à la base de données
 * 
 * Ce module est marqué @Global pour que PrismaService
 * soit disponible partout sans import explicite
 * 
 * Les repositories sont fournis avec des tokens d'injection
 * qui correspondent aux interfaces du Core Layer
 */
@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'IUserInteractor',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ITaskInteractor',
      useClass: PrismaTaskRepository,
    },
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
    
    {
      provide: 'IScrumNoteInteractor',
      useClass: PrismaScrumNoteRepository,
    },
    {
      provide: 'IScrumNoteRepository',
      useClass: PrismaScrumNoteRepository,
    },
    {
      provide: 'INotificationInteractor',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    PrismaService,
    'IUserInteractor',
    'IUserRepository',
    'ITaskInteractor',
    'ITaskRepository',
    'IScrumNoteInteractor',
    'IScrumNoteRepository',
    'INotificationInteractor',
    'INotificationRepository',
  ],
})
export class DatabaseModule { }
