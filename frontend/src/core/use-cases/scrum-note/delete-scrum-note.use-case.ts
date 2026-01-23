import { IScrumNoteRepository } from '@/core/domain/repositories/scrum-note.repository.interface';

/**
 * Use Case: Delete Scrum Note
 */
export class DeleteScrumNoteUseCase {
  constructor(private scrumNoteRepository: IScrumNoteRepository) {}

  async execute(id: string): Promise<void> {
    return this.scrumNoteRepository.delete(id);
  }
}
