import { ScrumNoteNotFoundException } from "@/core/domain/exceptions/scrum-note-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour supprimer une scrum note
 */
export interface DeleteScrumNoteInput {
  scrumNoteId: string;
  requesterId: string;
}

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

    async execute(input: DeleteScrumNoteInput): Promise<void> {
        //Vérifier que la note existe
        const note = await this.scrumNoteInteractor.findById(input.scrumNoteId);

        if(!note){
            throw new ScrumNoteNotFoundException(input.scrumNoteId);
        }

        //vérifier que le requester existe et récupérer son rôle
        const requester = await this.userInteractor.findById(input.requesterId);
        if (!requester) {
            throw new UserNotFoundException(input.requesterId);
        }

        //Vérifier les permissions 
        if (!note.canBeDeleted(input.requesterId, requester.role)) {
            throw new UnauthorizedException(input.requesterId, 'delete scrum note');
        }

        //Supprimer
        await this.scrumNoteInteractor.delete(input.scrumNoteId);
    }

}