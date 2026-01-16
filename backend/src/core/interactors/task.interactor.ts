import { Task } from "../domain/entities/task.entity";
import { TaskStatus } from "../domain/enums/task-status.enum";

/**
 * Interface de l'interactor Task
 * 
 * Cette interface définit le contrat que l'infrastructure doit implémenter.
 * Elle fait partie du Core (Domain Layer) et ne doit PAS dépendre de Prisma,
 * TypeORM ou tout autre framework de persistance.
 * 
 * C'est un PORT dans l'architecture hexagonale.
 */
export interface ITaskInteractor {
  /**
   * Récupère une tâche par son ID
   * 
   * @param id - ID de la tâche
   * @returns La tâche si trouvée, null sinon
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Récupère toutes les tâches
   * 
   * @returns Liste de toutes les tâches
   */
  findAll(): Promise<Task[]>;

  /**
   * Récupère les tâches par statut
   * 
   * @param status - Statut des tâches à récupérer
   * @returns Liste des tâches avec ce statut
   */
  findByStatus(status: TaskStatus): Promise<Task[]>;

  /**
   * Récupère les tâches assignées à un utilisateur
   * 
   * @param assigneeId - ID de l'utilisateur assigné
   * @returns Liste des tâches assignées à cet utilisateur
   */
  findByAssignee(assigneeId: string): Promise<Task[]>;

  /**
   * Récupère les tâches en retard (deadline passée et status != DONE)
   * 
   * @returns Liste des tâches en retard
   */
  findOverdue(): Promise<Task[]>;

  /**
   * Sauvegarde une tâche (création ou mise à jour)
   * 
   * @param task - Tâche à sauvegarder
   * @returns La tâche sauvegardée
   */
  save(task: Task): Promise<Task>;

  /**
   * Supprime une tâche
   * 
   * @param id - ID de la tâche à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si une tâche existe
   * 
   * @param id - ID de la tâche
   * @returns true si la tâche existe, false sinon
   */
  exists(id: string): Promise<boolean>;
}