import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { ScrumNoteNotFoundException } from "@/core/domain/exceptions/scrum-note-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour mettre à jour une note de scrum
 */
export interface UpdateScrumNoteInput {
  noteId: string;
  whatIDid?: string;
  blockers?: string;
  nextSteps?: string;
  userId: string; // L'utilisateur qui fait la demande
  userRole: UserRole; // Rôle de l'utilisateur
}

/**
 * Use Case : Mettre à jour une note de scrum
 * 
 * Règles métier :
 * - Un ADMIN peut modifier n'importe quelle note
 * - Un INTERN ne peut modifier que ses propres notes
 */
export class UpdateScrumNoteUseCase {
  constructor(
    private readonly scrumNoteInteractor: IScrumNoteInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: UpdateScrumNoteInput): Promise<ScrumNote> {
    //Vérifier que la note existe
    const note = await this.scrumNoteInteractor.findById(input.noteId);
    
    if (!note) {
      throw new ScrumNoteNotFoundException(input.noteId);
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userInteractor.findById(input.userId);
    
    if (!user) {
      throw new UserNotFoundException(input.userId);
    }

    //Vérifier les permissions (la validation métier est dans l'entité)
    if (!note.canBeModifiedBy(input.userId, input.userRole)) {
      throw new UnauthorizedException(input.userId, 'update scrum note');
    }

    // Mettre à jour (la validation métier est dans l'entité)
    note.update({
      whatIDid: input.whatIDid,
      blockers: input.blockers,
      nextSteps: input.nextSteps,
    });

    // Sauvegarder
    return this.scrumNoteInteractor.save(note);
  }
}
