import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Notification } from '@/core/domain/entities/notification.entity';
import { INotificationEmitter } from '@/core/interactors';
import { NotificationResponseDto } from './dto';

/**
 * Interface pour les événements SSE
 */
export interface NotificationEvent {
  userId: string;
  notification: Notification;
}

/**
 * Interface pour les événements SSE NestJS
 */
export interface SSEMessage {
  data: NotificationResponseDto;
  type?: string;
  id?: string;
  retry?: number;
}

/**
 * Service pour émettre des notifications en temps réel via SSE
 * 
 * Ce service implémente l'interface INotificationEmitter du Core Layer
 * et gère les connexions SSE des clients.
 */
@Injectable()
export class NotificationEmitterService implements INotificationEmitter {
  private readonly notificationSubject = new Subject<NotificationEvent>();

  /**
   * Émet une notification vers un utilisateur spécifique
   */
  emit(userId: string, notification: Notification): void {
    this.notificationSubject.next({ userId, notification });
  }

  /**
   * Émet une notification vers plusieurs utilisateurs
   */
  emitToMany(userIds: string[], notification: Notification): void {
    userIds.forEach(userId => this.emit(userId, notification));
  }

  /**
   * S'abonne aux notifications d'un utilisateur spécifique
   * Retourne un Observable pour le SSE
   * 
   * @param userId - ID de l'utilisateur
   * @returns Observable de SSEMessage pour le SSE
   */
  subscribe(userId: string): Observable<SSEMessage> {
    return this.notificationSubject.pipe(
      filter(event => event.userId === userId),
      map(event => {
        const dto = NotificationResponseDto.fromEntity(event.notification);
        return {
          data: dto,
          type: 'notification',
          id: event.notification.id,
          retry: 5000,
        };
      }),
    );
  }

  /**
   * Retourne l'observable brut pour des cas d'usage avancés
   */
  getNotificationStream(): Observable<NotificationEvent> {
    return this.notificationSubject.asObservable();
  }
}
