import { Notification } from "@/core/domain/entities/notification.entity";
import { INotificationInteractor } from "@/core/interactors";

/**
 * Use Case : Marquer une notification comme lue
 */
export class MarkNotificationReadUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(notificationId: string): Promise<Notification | null> {
    return this.notificationInteractor.markAsRead(notificationId);
  }
}
