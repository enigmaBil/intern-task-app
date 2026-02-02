import { INotificationInteractor } from "@/core/interactors";

/**
 * Use Case : Supprimer les notifications expirées
 * 
 * Peut être exécuté via un cron job
 */
export class DeleteExpiredNotificationsUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(retentionDays: number = 30): Promise<number> {
    return this.notificationInteractor.deleteExpired(retentionDays);
  }
}
