import { ScrumNoteRepository } from '@/infrastructure/repositories';
import {
  CreateScrumNoteUseCase,
  GetAllScrumNotesUseCase,
  UpdateScrumNoteUseCase,
  DeleteScrumNoteUseCase,
} from '../use-cases/scrum-note';

export class ScrumNoteInteractor {
  private scrumNoteRepository: ScrumNoteRepository;
  
  // Use cases
  public readonly createScrumNote: CreateScrumNoteUseCase;
  public readonly getAllScrumNotes: GetAllScrumNotesUseCase;
  public readonly updateScrumNote: UpdateScrumNoteUseCase;
  public readonly deleteScrumNote: DeleteScrumNoteUseCase;

  constructor() {
    this.scrumNoteRepository = new ScrumNoteRepository();
    
    // Initialize use cases
    this.createScrumNote = new CreateScrumNoteUseCase(this.scrumNoteRepository);
    this.getAllScrumNotes = new GetAllScrumNotesUseCase(this.scrumNoteRepository);
    this.updateScrumNote = new UpdateScrumNoteUseCase(this.scrumNoteRepository);
    this.deleteScrumNote = new DeleteScrumNoteUseCase(this.scrumNoteRepository);
  }
}

// Singleton instance
export const scrumNoteInteractor = new ScrumNoteInteractor();
