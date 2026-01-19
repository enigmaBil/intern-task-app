import { Module } from '@nestjs/common';
import { CreateScrumNoteUseCase } from '@/core/use-cases/scrum-note/create-scrum-note.use-case';
import { DeleteScrumNoteUseCase } from '@/core/use-cases/scrum-note/delete-scrum-note.use-case';
import { GetTodayNotesUseCase } from '@/core/use-cases/scrum-note/get-today-notes.use-case';
import { GetUserNotesUseCase } from '@/core/use-cases/scrum-note/get-user-notes.use-case';
import { UpdateScrumNoteUseCase } from '@/core/use-cases/scrum-note/update-scrum-note.use-case';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { ScrumNoteController } from './scrum-note.controller';

/**
 * Module de présentation pour les notes de scrum
 * 
 * Gère les endpoints HTTP pour les opérations CRUD sur les notes quotidiennes.
 * Injecte tous les use-cases et les repositories via DatabaseModule.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ScrumNoteController],
  providers: [
    // Use Case: Create Scrum Note
    {
      provide: CreateScrumNoteUseCase,
      useFactory: (scrumNoteInteractor, userInteractor) =>
        new CreateScrumNoteUseCase(scrumNoteInteractor, userInteractor),
      inject: ['IScrumNoteInteractor', 'IUserInteractor'],
    },
    // Use Case: Get Today's Notes
    {
      provide: GetTodayNotesUseCase,
      useFactory: (scrumNoteInteractor) =>
        new GetTodayNotesUseCase(scrumNoteInteractor),
      inject: ['IScrumNoteInteractor'],
    },
    // Use Case: Get User Notes
    {
      provide: GetUserNotesUseCase,
      useFactory: (scrumNoteInteractor, userInteractor) =>
        new GetUserNotesUseCase(scrumNoteInteractor, userInteractor),
      inject: ['IScrumNoteInteractor', 'IUserInteractor'],
    },
    // Use Case: Update Scrum Note
    {
      provide: UpdateScrumNoteUseCase,
      useFactory: (scrumNoteInteractor, userInteractor) =>
        new UpdateScrumNoteUseCase(scrumNoteInteractor, userInteractor),
      inject: ['IScrumNoteInteractor', 'IUserInteractor'],
    },
    // Use Case: Delete Scrum Note
    {
      provide: DeleteScrumNoteUseCase,
      useFactory: (scrumNoteInteractor, userInteractor) =>
        new DeleteScrumNoteUseCase(scrumNoteInteractor, userInteractor),
      inject: ['IScrumNoteInteractor', 'IUserInteractor'],
    },
  ],
  exports: [],
})
export class ScrumNoteModule {}
