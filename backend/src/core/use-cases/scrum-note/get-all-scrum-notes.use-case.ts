import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { IScrumNoteInteractor } from "@/core/interactors";

export interface GetAllScrumNotesInput {
  userId: string;
  userRole: UserRole;
}

/**
 * Use Case : Récupérer toutes les notes de scrum
 * 
 * Règles métier :
 * - ADMIN : Retourne toutes les notes
 * - INTERN : Retourne uniquement ses propres notes
 */
export class GetAllScrumNotesUseCase {
  constructor(private readonly scrumNoteInteractor: IScrumNoteInteractor) {}

  async execute(input: GetAllScrumNotesInput): Promise<ScrumNote[]> {
    // ADMIN voit toutes les notes
    if (input.userRole === UserRole.ADMIN) {
      return this.scrumNoteInteractor.findAll();
    }
    
    // INTERN voit uniquement ses propres notes
    return this.scrumNoteInteractor.findByUserId(input.userId);
  }
}
