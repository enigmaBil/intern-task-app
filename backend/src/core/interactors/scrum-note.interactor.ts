import { ScrumNote } from "../domain/entities/scrum-note.entity";

/**
 * Interface de l'interactor ScrumNote
 * 
 * PORT pour l'accès aux scrum notes.
 */
export interface IScrumNoteInteractor {
  /**
   * Récupère une note de scrum par son ID
   * 
   * @param id - ID de la note
   * @returns La note si trouvée, null sinon
   */
  findById(id: string): Promise<ScrumNote | null>;

  /**
   * Récupère toutes les notes de scrum d'un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @returns Liste des notes de cet utilisateur
   */
  findByUserId(userId: string): Promise<ScrumNote[]>;

  /**
   * Récupère les notes de scrum pour une date donnée
   * 
   * @param date - Date des notes (sera normalisée au début de la journée)
   * @returns Liste des notes pour cette date
   */
  findByDate(date: Date): Promise<ScrumNote[]>;

  /**
   * Récupère les notes d'aujourd'hui
   * 
   * @returns Liste des notes d'aujourd'hui
   */
  findToday(): Promise<ScrumNote[]>;

  /**
   * Récupère la note d'un utilisateur pour une date donnée
   * Il ne peut y avoir qu'une seule note par utilisateur et par jour
   * 
   * @param userId - ID de l'utilisateur
   * @param date - Date de la note
   * @returns La note si trouvée, null sinon
   */
  findByUserAndDate(userId: string, date: Date): Promise<ScrumNote | null>;

  /**
   * Récupère les notes d'un utilisateur pour une période
   * 
   * @param userId - ID de l'utilisateur
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @returns Liste des notes dans cette période
   */
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ScrumNote[]>;

  /**
   * Sauvegarde une note de scrum (création ou mise à jour)
   * 
   * @param note - Note à sauvegarder
   * @returns La note sauvegardée
   */
  save(note: ScrumNote): Promise<ScrumNote>;

  /**
   * Supprime une note de scrum
   * 
   * @param id - ID de la note à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si une note existe
   * 
   * @param id - ID de la note
   * @returns true si la note existe, false sinon
   */
  exists(id: string): Promise<boolean>;
}
