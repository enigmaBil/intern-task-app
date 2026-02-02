import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { NotificationDomainService } from "@/core/domain/services/notification-domain.service";
import { IScrumNoteInteractor, IUserInteractor, INotificationInteractor, INotificationEmitter } from "@/core/interactors";

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
 * - Si un INTERN crée une note, tous les ADMINS reçoivent une notification
 */
export class CreateScrumNoteUseCase {
  constructor(
    private readonly scrumNoteInteractor: IScrumNoteInteractor,
    private readonly userInteractor: IUserInteractor,
    private readonly notificationInteractor?: INotificationInteractor,
    private readonly notificationEmitter?: INotificationEmitter,
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
    const savedNote = await this.scrumNoteInteractor.save(note);

    // Envoyer une notification à tous les admins si c'est un intern qui crée la note
    if (
      this.notificationInteractor && 
      this.notificationEmitter && 
      user.role === UserRole.INTERN
    ) {
      try {
        // Récupérer tous les admins
        const allUsers = await this.userInteractor.findAll();
        const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
        
        const creatorName = `${user.firstName} ${user.lastName}`;
        
        // Créer et envoyer une notification pour chaque admin
        for (const admin of admins) {
          const notification = NotificationDomainService.createScrumNoteCreatedNotification(
            admin.id,
            savedNote.id,
            creatorName,
            user.id,
            savedNote.date,
          );
          
          await this.notificationInteractor.save(notification);
          this.notificationEmitter.emit(admin.id, notification);
        }
      } catch (error) {
        // Log l'erreur mais ne pas faire échouer l'opération principale
        console.error('Failed to send notifications:', error);
      }
    }

    return savedNote;
  }
}