import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";


/**
 * Input pour récupérer les notes d'un utilisateur
 */
export interface GetUserNotesInput {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Use Case : Récupérer l'historique des notes d'un utilisateur
 * 
 * Peut être filtré par période
 */
export class GetUserNotesUseCase {
  constructor(
    private readonly scrumNoteInteractor: IScrumNoteInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: GetUserNotesInput): Promise<ScrumNote[]> {
    //Vérifier que l'utilisateur existe
    const userExists = await this.userInteractor.exists(input.userId);
    
    if (!userExists) {
      throw new UserNotFoundException(input.userId);
    }

    // Récupérer les notes
    if (input.startDate && input.endDate) {
      return this.scrumNoteInteractor.findByUserAndDateRange(
        input.userId,
        input.startDate,
        input.endDate,
      );
    }

    return this.scrumNoteInteractor.findByUserId(input.userId);
  }
}