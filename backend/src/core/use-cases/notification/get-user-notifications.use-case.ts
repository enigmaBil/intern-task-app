import { Notification } from "@/core/domain/entities/notification.entity";
import { INotificationInteractor } from "@/core/interactors";

/**
 * Input pour récupérer les notifications d'un utilisateur
 */
export interface GetUserNotificationsInput {
  userId: string;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Output pour les notifications avec count
 */
export interface GetUserNotificationsOutput {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Use Case : Récupérer les notifications d'un utilisateur
 * 
 * Règles métier :
 * - Par défaut, retourne les 10 dernières notifications
 * - Peut filtrer sur les non lues uniquement
 */
export class GetUserNotificationsUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(input: GetUserNotificationsInput): Promise<GetUserNotificationsOutput> {
    const limit = input.limit ?? 10;
    
    const [notifications, unreadCount] = await Promise.all([
      this.notificationInteractor.findByRecipient(
        input.userId, 
        limit, 
        input.unreadOnly
      ),
      this.notificationInteractor.countUnread(input.userId),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }
}
