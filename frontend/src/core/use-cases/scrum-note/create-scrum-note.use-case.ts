import { IScrumNoteRepository, CreateScrumNoteDto } from '@/core/domain/repositories';
import { ScrumNote } from '@/core/domain/entities';

export class CreateScrumNoteUseCase {
  constructor(private readonly scrumNoteRepository: IScrumNoteRepository) {}

  async execute(data: CreateScrumNoteDto): Promise<ScrumNote> {
    return await this.scrumNoteRepository.create(data);
  }
}
