import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";

/**
 * Input pour créer une note de scrum
 */
export interface CreateScrumNoteInput {
  whatIDid: string;
  blockers?: string;
  nextSteps: string;
  userId: string;
  date?: Date;
}

/**
 * Use Case : Créer une nouvelle note de scrum quotidien
 * 
 * Règles métier :
 * - L'utilisateur doit exister
 * - Une seule note par utilisateur et par jour
 * - Les champs whatIDid et nextSteps sont obligatoires
 */
export class CreateScrumNoteUseCase {
  constructor(
    private readonly scrumNoteInteractor: IScrumNoteInteractor,
    private readonly userInteractor: IUserInteractor,
  ) {}

  async execute(input: CreateScrumNoteInput): Promise<ScrumNote> {
    //Vérifier que l'utilisateur existe
    const user = await this.userInteractor.findById(input.userId);
    
    if (!user) {
      throw new UserNotFoundException(input.userId);
    }

    // Vérifier qu'il n'existe pas déjà une note pour cet utilisateur et cette date
    const noteDate = input.date || new Date();
    const existingNote = await this.scrumNoteInteractor.findByUserAndDate(
      input.userId,
      noteDate,
    );

    if (existingNote) {
      throw new Error(
        `A scrum note already exists for this user on ${noteDate.toDateString()}`,
      );
    }

    //Créer la note
    const note = ScrumNote.create({
      whatIDid: input.whatIDid,
      blockers: input.blockers,
      nextSteps: input.nextSteps,
      userId: input.userId,
      date: input.date,
    });

    //Sauvegarder
    return this.scrumNoteInteractor.save(note);
  }
}