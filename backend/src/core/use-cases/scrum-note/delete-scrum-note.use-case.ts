import { UserRole } from "@/core/domain/enums/user-role.enum";
import { ScrumNoteNotFoundException } from "@/core/domain/exceptions/scrum-note-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Supprimer une scrum note
 * 
 * Règles métier :
 * - ADMIN peut supprimer n'importe quelle scrum note du système
 * - Un intern peut supprimer uniquement ses propres scrum notes
 */
export class DeleteScrumNoteUseCase {
  constructor(
    private readonly scrumNoteInteractor: IScrumNoteInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(scrumNoteId: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    //Vérifier que la note existe
    const note = await this.scrumNoteInteractor.findById(scrumNoteId);

    if(!note){
      throw new ScrumNoteNotFoundException(scrumNoteId);
    }

    //vérifier que le requester existe
    const requester = await this.userInteractor.findById(requesterId);
    if (!requester) {
      throw new UserNotFoundException(requesterId);
    }

    //Vérifier les permissions 
    if (!note.canBeDeleted(requesterId, requesterRole)) {
      throw new UnauthorizedException(requesterId, 'delete scrum note');
    }

    //Supprimer
    await this.scrumNoteInteractor.delete(scrumNoteId);
  }
}