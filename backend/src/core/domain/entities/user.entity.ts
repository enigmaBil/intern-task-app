import { UserRole } from '../enums/user-role.enum';
import { Task } from './task.entity';

/**
 * Entity User - Représente un utilisateur du système
 */
export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public role: UserRole,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Reconstruit un utilisateur depuis la base de données
   */
  static reconstitute(data: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.role,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Vérifie si l'utilisateur est un admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est un stagiaire
   */
  isIntern(): boolean {
    return this.role === UserRole.INTERN;
  }

  /**
   * Vérifie si l'utilisateur peut assigner des tâches
   */
  canAssignTasks(): boolean {
    return this.isAdmin();
  }

  /**
   * Vérifie si l'utilisateur peut modifier une tâche
   */
  canModifyTask(task: Task): boolean {
    if (this.isAdmin()) return true;
    return task.isAssignedTo(this.id);
  }
}