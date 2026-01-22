import { IScrumNoteRepository } from '@/core/domain/repositories';
import { ScrumNote } from '@/core/domain/entities';

export class GetAllScrumNotesUseCase {
  constructor(private readonly scrumNoteRepository: IScrumNoteRepository) {}

  async execute(userId?: string): Promise<ScrumNote[]> {
    return await this.scrumNoteRepository.findAll(userId);
  }
}
