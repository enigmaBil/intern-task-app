import { Notification, NotificationListResponse } from '@/core/domain/entities';
import { httpClient } from '../http';
import { API_CONFIG } from '@/shared/constants';

/**
 * Repository pour les notifications
 * 
 * Gère les appels API pour les notifications et la connexion SSE
 */
export class NotificationRepository {
  private readonly endpoint = API_CONFIG.ENDPOINTS.NOTIFICATIONS;

  /**
   * Récupère les dernières notifications de l'utilisateur
   * 
   * @param limit - Nombre maximum de notifications (défaut: 10)
   * @param unreadOnly - Filtrer uniquement les non lues
   */
  async getNotifications(limit: number = 10, unreadOnly: boolean = false): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('unreadOnly', unreadOnly.toString());

    const response = await httpClient.get<NotificationListResponse>(
      `${this.endpoint}?${params.toString()}`
    );
    
    return response.data;
  }

  /**
   * Récupère toutes les notifications non lues
   */
  async getAllUnread(): Promise<Notification[]> {
    const response = await httpClient.get<Notification[]>(`${this.endpoint}/unread`);
    return response.data;
  }

  /**
   * Marque une notification comme lue
   * 
   * @param id - ID de la notification
   */
  async markAsRead(id: string): Promise<Notification | null> {
    const response = await httpClient.patch<Notification | null>(`${this.endpoint}/${id}/read`, {});
    return response.data;
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await httpClient.patch<{ count: number }>(`${this.endpoint}/read-all`, {});
    return response.data;
  }

  /**
   * Crée une connexion SSE pour recevoir les notifications en temps réel
   * 
   * @param token - Token d'authentification
   * @param onMessage - Callback appelé à chaque nouvelle notification
   * @param onError - Callback appelé en cas d'erreur
   * @returns Fonction pour fermer la connexion
   */
  createSSEConnection(
    token: string,
    onMessage: (notification: Notification) => void,
    onError?: (error: Event) => void,
  ): () => void {
    const url = `${API_CONFIG.BASE_URL}${this.endpoint}/stream`;
    
    // Créer l'EventSource avec le token dans les headers via un proxy
    // Note: EventSource ne supporte pas les headers personnalisés nativement
    // On utilise un workaround avec le token dans l'URL ou via cookies
    const eventSource = new EventSource(`${url}?token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        onMessage(notification);
      } catch (error) {
        console.error('[NotificationRepository] Failed to parse SSE message:', error);
      }
    };

    eventSource.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse((event as MessageEvent).data) as Notification;
        onMessage(notification);
      } catch (error) {
        console.error('[NotificationRepository] Failed to parse notification event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[NotificationRepository] SSE connection error:', error);
      onError?.(error);
    };

    // Retourner une fonction pour fermer la connexion
    return () => {
      eventSource.close();
    };
  }
}

// Singleton pour l'utilisation dans l'application
export const notificationRepository = new NotificationRepository();
