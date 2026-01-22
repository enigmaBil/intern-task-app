import { ScrumNote } from '../entities';

export interface CreateScrumNoteDto {
  date: Date;
  whatDidYesterday: string;
  whatWillDoToday: string;
  blockers: string;
}

export interface UpdateScrumNoteDto {
  whatDidYesterday?: string;
  whatWillDoToday?: string;
  blockers?: string;
}

export interface IScrumNoteRepository {
  findAll(userId?: string): Promise<ScrumNote[]>;
  findById(id: string): Promise<ScrumNote | null>;
  findByUserAndDate(userId: string, date: Date): Promise<ScrumNote | null>;
  create(data: CreateScrumNoteDto): Promise<ScrumNote>;
  update(id: string, data: UpdateScrumNoteDto): Promise<ScrumNote>;
  delete(id: string): Promise<void>;
}
