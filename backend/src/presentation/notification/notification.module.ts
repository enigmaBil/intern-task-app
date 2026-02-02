import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import {
  GetUserNotificationsUseCase,
  GetAllUnreadNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from '@/core/use-cases/notification';
import { NotificationController } from './notification.controller';
import { NotificationEmitterService } from './notification-emitter.service';

/**
 * Module de présentation pour les notifications
 * 
 * Ce module est marqué @Global pour que NotificationEmitterService
 * soit disponible dans les autres modules (TaskModule, ScrumNoteModule)
 * sans avoir à l'importer explicitement.
 */
@Global()
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotificationController],
  providers: [
    // Service d'émission SSE (singleton global)
    NotificationEmitterService,
    
    // Token pour l'interface INotificationEmitter
    {
      provide: 'INotificationEmitter',
      useExisting: NotificationEmitterService,
    },

    // Use Case: Get User Notifications
    {
      provide: GetUserNotificationsUseCase,
      useFactory: (notificationInteractor) =>
        new GetUserNotificationsUseCase(notificationInteractor),
      inject: ['INotificationInteractor'],
    },

    // Use Case: Get All Unread Notifications
    {
      provide: GetAllUnreadNotificationsUseCase,
      useFactory: (notificationInteractor) =>
        new GetAllUnreadNotificationsUseCase(notificationInteractor),
      inject: ['INotificationInteractor'],
    },

    // Use Case: Mark Notification Read
    {
      provide: MarkNotificationReadUseCase,
      useFactory: (notificationInteractor) =>
        new MarkNotificationReadUseCase(notificationInteractor),
      inject: ['INotificationInteractor'],
    },

    // Use Case: Mark All Notifications Read
    {
      provide: MarkAllNotificationsReadUseCase,
      useFactory: (notificationInteractor) =>
        new MarkAllNotificationsReadUseCase(notificationInteractor),
      inject: ['INotificationInteractor'],
    },
  ],
  exports: [
    NotificationEmitterService,
    'INotificationEmitter',
  ],
})
export class NotificationModule {}
