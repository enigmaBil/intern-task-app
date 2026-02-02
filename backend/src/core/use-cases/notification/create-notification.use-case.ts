import { Notification, CreateNotificationData } from "@/core/domain/entities/notification.entity";
import { INotificationInteractor } from "@/core/interactors";

/**
 * Use Case : Créer une nouvelle notification
 * 
 * Règles métier :
 * - Le destinataire doit exister
 * - Le message ne peut pas être vide
 */
export class CreateNotificationUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(input: CreateNotificationData): Promise<Notification> {
    // Créer la notification (la validation métier est dans l'entité)
    const notification = Notification.create(input);

    // Sauvegarder
    return this.notificationInteractor.save(notification);
  }
}
