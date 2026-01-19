import { ScrumNote } from '@/core/domain/entities/scrum-note.entity';
import { ScrumNoteResponseDto } from '../dto';

/**
 * Mapper pour convertir entre les entités ScrumNote (Domain)
 * et les DTOs de présentation (API)
 * 
 * Responsabilité : Transformation des données entre les couches
 */
export class ScrumNotePresentationMapper {
  /**
   * Convertit une entité ScrumNote (domain) vers un DTO de réponse (presentation)
   * 
   * @param note - Entité ScrumNote du domaine
   * @returns DTO pour la réponse API
   */
  static toDto(note: ScrumNote): ScrumNoteResponseDto {
    const dto = new ScrumNoteResponseDto();
    dto.id = note.id;
    dto.date = note.date;
    dto.whatIDid = note.whatIDid;
    dto.nextSteps = note.nextSteps;
    dto.blockers = note.blockers;
    dto.userId = note.userId;
    dto.createdAt = note.createdAt;
    dto.updatedAt = note.updatedAt;
    return dto;
  }

  /**
   * Convertit une liste d'entités ScrumNote vers une liste de DTOs
   * 
   * @param notes - Liste d'entités ScrumNote
   * @returns Liste de DTOs
   */
  static toDtoList(notes: ScrumNote[]): ScrumNoteResponseDto[] {
    return notes.map((note) => this.toDto(note));
  }
}
