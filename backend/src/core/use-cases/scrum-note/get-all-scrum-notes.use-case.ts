import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { IScrumNoteInteractor } from "@/core/interactors";

/**
 * Use Case : Récupérer toutes les notes de scrum
 * 
 * Règles métier :
 * - Retourne toutes les notes sans filtre
 * - Utilisé pour l'affichage administratif ou la liste complète
 */
export class GetAllScrumNotesUseCase {
  constructor(private readonly scrumNoteInteractor: IScrumNoteInteractor) {}

  async execute(): Promise<ScrumNote[]> {
    return this.scrumNoteInteractor.findAll();
  }
}
