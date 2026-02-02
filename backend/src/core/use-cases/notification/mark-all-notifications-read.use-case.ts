import { INotificationInteractor } from "@/core/interactors";

/**
 * Use Case : Marquer toutes les notifications d'un utilisateur comme lues
 */
export class MarkAllNotificationsReadUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationInteractor.markAllAsRead(userId);
  }
}
