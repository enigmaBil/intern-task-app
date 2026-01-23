import { ScrumNote, UpdateScrumNoteDto } from '@/core/domain/repositories/scrum-note.repository.interface';
import { IScrumNoteRepository } from '@/core/domain/repositories/scrum-note.repository.interface';

/**
 * Use Case: Update Scrum Note
 */
export class UpdateScrumNoteUseCase {
  constructor(private scrumNoteRepository: IScrumNoteRepository) {}

  async execute(id: string, data: UpdateScrumNoteDto): Promise<ScrumNote> {
    return this.scrumNoteRepository.update(id, data);
  }
}
