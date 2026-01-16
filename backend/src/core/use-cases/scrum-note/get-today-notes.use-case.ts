import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer toutes les notes de scrum d'aujourd'hui
 * 
 * Règles métier :
 * - Aucune règle métier spécifique
 */
export class GetTodayNotesUseCase {
  constructor(private readonly scrumNoteInteractor: IScrumNoteInteractor) {}

  async execute(): Promise<ScrumNote[]> {
    return this.scrumNoteInteractor.findToday();
  }
}