import { ScrumNoteRepository } from '@/infrastructure/repositories';
import {
  CreateScrumNoteUseCase,
  GetAllScrumNotesUseCase,
} from '../use-cases/scrum-note';

export class ScrumNoteInteractor {
  private scrumNoteRepository: ScrumNoteRepository;
  
  // Use cases
  public readonly createScrumNote: CreateScrumNoteUseCase;
  public readonly getAllScrumNotes: GetAllScrumNotesUseCase;

  constructor() {
    this.scrumNoteRepository = new ScrumNoteRepository();
    
    // Initialize use cases
    this.createScrumNote = new CreateScrumNoteUseCase(this.scrumNoteRepository);
    this.getAllScrumNotes = new GetAllScrumNotesUseCase(this.scrumNoteRepository);
  }
}

// Singleton instance
export const scrumNoteInteractor = new ScrumNoteInteractor();
