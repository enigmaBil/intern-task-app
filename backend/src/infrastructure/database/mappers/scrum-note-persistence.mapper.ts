import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { Prisma } from "@prisma/client";
import {ScrumNote as PrismaScrumNote} from "@prisma/client";

/**
 * Mapper pour convertir entre l'entité ScrumNote (Domain)
 * et le modèle Prisma ScrumNote (Infrastructure)
 */
export class ScrumNotePersistenceMapper {
  /**
   * Convertit un modèle Prisma ScrumNote vers une entité Domain ScrumNote
   * 
   * @param prismaScrumNote - Modèle Prisma récupéré de la DB
   * @returns Entité ScrumNote du domain
   */
  static toDomain(prismaScrumNote: PrismaScrumNote): ScrumNote {
    return ScrumNote.reconstitute({
      id: prismaScrumNote.id,
      date: prismaScrumNote.date,
      whatIDid: prismaScrumNote.whatIDid || '',
      blockers: prismaScrumNote.blockers || '',
      nextSteps: prismaScrumNote.nextSteps || '',
      userId: prismaScrumNote.userId,
      createdAt: prismaScrumNote.createdAt,
      updatedAt: prismaScrumNote.updatedAt,
    });
  }

  /**
   * Convertit une liste de modèles Prisma vers des entités Domain
   * 
   * @param prismaScrumNotes - Liste de modèles Prisma
   * @returns Liste d'entités ScrumNote du domain
   */
  static toDomainList(prismaScrumNotes: PrismaScrumNote[]): ScrumNote[] {
    return prismaScrumNotes.map((note) => this.toDomain(note));
  }

  /**
   * Convertit une entité ScrumNote vers un objet Prisma.ScrumNoteCreateInput
   * Utilisé pour les opérations de création
   * 
   * @param note - Entité ScrumNote du domain
   * @returns Objet Prisma pour la création
   */
  static toPrismaCreate(note: ScrumNote): Prisma.ScrumNoteCreateInput {
    return {
      id: note.id,
      date: note.date,
      whatIDid: note.whatIDid,
      blockers: note.blockers,
      nextSteps: note.nextSteps,
      user: {
        connect: { id: note.userId },
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Convertit une entité ScrumNote vers un objet Prisma.ScrumNoteUpdateInput
   * Utilisé pour les opérations de mise à jour
   * 
   * @param note - Entité ScrumNote du domain
   * @returns Objet Prisma pour la mise à jour
   */
  static toPrismaUpdate(note: ScrumNote): Prisma.ScrumNoteUpdateInput {
    return {
      whatIDid: note.whatIDid,
      blockers: note.blockers,
      nextSteps: note.nextSteps,
      updatedAt: note.updatedAt,
    };
  }
}