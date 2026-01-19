import { TaskStatus } from '../enums/task-status.enum';
import { UserRole } from '../enums/user-role.enum';
import { InvalidTaskTransitionException } from '../exceptions/invalid-task-transition.exception';
import { TaskNotAssignableException } from '../exceptions/task-not-assignable.exception';

/**
 * Interface pour créer une nouvelle tâche
 */
export interface CreateTaskData {
  title: string;
  description: string;
  creatorId: string;
  deadline?: Date;
}

/**
 * Entity Task - Représente une tâche dans le système
 * 
 * Contient toute la logique métier liée aux tâches.
 * Cette classe est indépendante de tout framework.
 */
export class Task {
  private constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public readonly creatorId: string,
    public assigneeId: string | null,
    public deadline: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Factory method pour créer une nouvelle tâche
   * 
   * @param data - Données nécessaires pour créer une tâche
   * @returns Une nouvelle instance de Task
   * @throws Error si les données sont invalides
   */
  static create(data: CreateTaskData): Task {
    // Validation métier
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (data.title.length > 255) {
      throw new Error('Task title cannot exceed 255 characters');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Task description cannot be empty');
    }

    // Validation de la deadline
    if (data.deadline && data.deadline < new Date()) {
      throw new Error('Task deadline cannot be in the past');
    }

    const now = new Date();

    return new Task(
      crypto.randomUUID(),
      data.title.trim(),
      data.description.trim(),
      TaskStatus.TODO,
      data.creatorId,
      null,
      data.deadline || null,
      now,
      now,
    );
  }

  /**
   * Reconstruit une tâche depuis la base de données
   * 
   * @param data - Toutes les propriétés d'une tâche existante
   * @returns Instance de Task
   */
  static reconstitute(data: {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    creatorId: string;
    assigneeId: string | null;
    deadline: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      data.id,
      data.title,
      data.description,
      data.status,
      data.creatorId,
      data.assigneeId,
      data.deadline,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Assigne la tâche à un utilisateur
   * 
   * @param userId - ID de l'utilisateur à assigner
   * @param requesterRole - Rôle de l'utilisateur qui fait la demande
   * @throws TaskNotAssignableException si la tâche ne peut pas être assignée
   */
  assign(userId: string, requesterRole: UserRole): void {
    // Règle métier : seul un admin peut assigner une tâche
    if (requesterRole !== UserRole.ADMIN) {
      throw new TaskNotAssignableException(
        this.id,
        'Only admins can assign tasks',
      );
    }

    // Règle métier : on ne peut pas assigner une tâche terminée
    if (this.status === TaskStatus.DONE) {
      throw new TaskNotAssignableException(
        this.id,
        'Cannot assign a completed task',
      );
    }

    this.assigneeId = userId;
    this.updatedAt = new Date();
  }

  /**
   * Change le statut de la tâche
   * 
   * @param newStatus - Nouveau statut
   * @param userId - ID de l'utilisateur qui fait la demande
   * @param userRole - Rôle de l'utilisateur
   * @throws InvalidTaskTransitionException si la transition n'est pas valide
   */
  updateStatus(newStatus: TaskStatus, userId: string, userRole: UserRole): void {
    // Règle métier : on ne peut pas repasser une tâche DONE en TODO
    if (this.status === TaskStatus.DONE && newStatus === TaskStatus.TODO) {
      throw new InvalidTaskTransitionException(this.status, newStatus);
    }

    // Règle métier : un intern ne peut modifier que ses propres tâches
    if (userRole === UserRole.INTERN && this.assigneeId !== userId) {
      throw new TaskNotAssignableException(
        this.id,
        'Interns can only update their own assigned tasks',
      );
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour les informations de la tâche
   * 
   * @param data - Nouvelles données
   * @param userRole - Rôle de l'utilisateur qui fait la demande
   */
  update(
    data: { title?: string; description?: string; deadline?: Date },
    userRole: UserRole,
  ): void {
    // Règle métier : seul un admin peut modifier une tâche
    if (userRole !== UserRole.ADMIN) {
      throw new TaskNotAssignableException(
        this.id,
        'Only admins can update task details',
      );
    }

    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Task title cannot be empty');
      }
      if (data.title.length > 255) {
        throw new Error('Task title cannot exceed 255 characters');
      }
      this.title = data.title.trim();
    }

    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        throw new Error('Task description cannot be empty');
      }
      this.description = data.description.trim();
    }

    if (data.deadline !== undefined) {
      if (data.deadline < new Date()) {
        throw new Error('Task deadline cannot be in the past');
      }
      this.deadline = data.deadline;
    }

    this.updatedAt = new Date();
  }

  /**
   * Vérifie si la tâche est en retard
   * 
   * @returns true si la deadline est dépassée et la tâche n'est pas terminée
   */
  isOverdue(): boolean {
    if (!this.deadline) return false;
    return this.deadline < new Date() && this.status !== TaskStatus.DONE;
  }

  /**
   * Vérifie si la tâche est assignée à un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @returns true si la tâche est assignée à cet utilisateur
   */
  isAssignedTo(userId: string): boolean {
    return this.assigneeId === userId;
  }

  /**
   * Vérifie si la tâche peut être supprimée
   * 
   * @param userRole - Rôle de l'utilisateur qui fait la demande
   * @returns true si la tâche peut être supprimée
   */
  canBeDeleted(userRole: UserRole): boolean {
    // Règle métier : seul un admin peut supprimer une tâche
    return userRole === UserRole.ADMIN;
  }
}