import { UserRole } from "../enums/user-role.enum";

/**
 * Interface pour créer une nouvelle note de scrum
 */
export interface CreateScrumNoteData {
  whatIDid: string;
  blockers?: string;
  nextSteps: string;
  userId: string;
  date?: Date;
}

/**
 * Entity ScrumNote - Représente une note de scrum quotidien
 */
export class ScrumNote {
  private constructor(
    public readonly id: string,
    public readonly date: Date,
    public whatIDid: string,
    public blockers: string,
    public nextSteps: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Factory method pour créer une nouvelle note de scrum
   */
  static create(data: CreateScrumNoteData): ScrumNote {
    // Validation métier
    if (!data.whatIDid || data.whatIDid.trim().length === 0) {
      throw new Error('What I did cannot be empty');
    }

    if (!data.nextSteps || data.nextSteps.trim().length === 0) {
      throw new Error('Next steps cannot be empty');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    const now = new Date();
    const noteDate = data.date || now;

    // Normaliser la date au début de la journée
    const normalizedDate = new Date(noteDate);
    normalizedDate.setHours(0, 0, 0, 0);

    return new ScrumNote(
      crypto.randomUUID(),
      normalizedDate,
      data.whatIDid.trim(),
      data.blockers?.trim() || '',
      data.nextSteps.trim(),
      data.userId,
      now,
      now,
    );
  }

  /**
   * Reconstruit une note de scrum depuis la base de données
   */
  static reconstitute(data: {
    id: string;
    date: Date;
    whatIDid: string;
    blockers: string;
    nextSteps: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): ScrumNote {
    return new ScrumNote(
      data.id,
      data.date,
      data.whatIDid,
      data.blockers,
      data.nextSteps,
      data.userId,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Met à jour la note de scrum
   */
  update(data: {
    whatIDid?: string;
    blockers?: string;
    nextSteps?: string;
  }): void {
    if (data.whatIDid !== undefined) {
      if (!data.whatIDid || data.whatIDid.trim().length === 0) {
        throw new Error('What I did cannot be empty');
      }
      this.whatIDid = data.whatIDid.trim();
    }

    if (data.blockers !== undefined) {
      this.blockers = data.blockers?.trim() || '';
    }

    if (data.nextSteps !== undefined) {
      if (!data.nextSteps || data.nextSteps.trim().length === 0) {
        throw new Error('Next steps cannot be empty');
      }
      this.nextSteps = data.nextSteps.trim();
    }

    this.updatedAt = new Date();
  }

  /**
   * Vérifie si la note appartient à un utilisateur
   */
  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Vérifie si la note peut être modifiée par un utilisateur
   */
  canBeModifiedBy(userId: string, userRole: UserRole): boolean {
    // Un admin peut modifier n'importe quelle note
    if (userRole === UserRole.ADMIN) return true;
    
    // Un intern ne peut modifier que ses propres notes
    return this.belongsToUser(userId);
  }

  /**
   * Vérifie si la note est d'aujourd'hui
   */
  isToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const noteDate = new Date(this.date);
    noteDate.setHours(0, 0, 0, 0);
    
    return noteDate.getTime() === today.getTime();
  }

  /**
   * Vérifie si la scrum note peut être supprimée
   * 
   * @param userRole - Rôle de l'utilisateur qui fait la demande
   * @returns true si la scrum note peut être supprimée
   */
  canBeDeleted(userId: string, userRole: UserRole): boolean {
    // Règle métier : un admin peut supprimer n'importe quelle scrum note
    if (userRole === UserRole.ADMIN) return true;

    // un intern peut supprimer uniquement ses propres scrum notes
    return this.belongsToUser(userId);
  }
}