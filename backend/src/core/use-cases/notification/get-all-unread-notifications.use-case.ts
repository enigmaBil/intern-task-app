import { Notification } from "@/core/domain/entities/notification.entity";
import { INotificationInteractor } from "@/core/interactors";

/**
 * Input pour récupérer toutes les notifications non lues
 */
export interface GetAllUnreadNotificationsInput {
  userId: string;
}

/**
 * Use Case : Récupérer toutes les notifications non lues d'un utilisateur
 * 
 * Utilisé pour la modale "Voir tout"
 */
export class GetAllUnreadNotificationsUseCase {
  constructor(
    private readonly notificationInteractor: INotificationInteractor,
  ) {}

  async execute(input: GetAllUnreadNotificationsInput): Promise<Notification[]> {
    return this.notificationInteractor.findByRecipient(
      input.userId,
      undefined, // Pas de limite
      true, // Uniquement les non lues
    );
  }
}
