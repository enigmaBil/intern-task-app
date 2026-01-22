'use client';

import { useScrumNotes } from '@/presentation/hooks/useScrumNotes';
import { AddScrumNoteModal } from '@/presentation/components/modals';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { ScrumNoteList } from '@/presentation/components/scrum-note/ScrumNoteList';

export default function ScrumNotesPage() {
  const { scrumNotes, isLoading, error, refetch } = useScrumNotes();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes Scrum</h1>
        <AddScrumNoteModal onNoteAdded={refetch} />
      </div>
      <p className="mt-4 text-gray-600">
        Daily stand-up notes de l'équipe
      </p>

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && <ScrumNoteList notes={scrumNotes} onNoteUpdated={refetch} />}
      </div>
    </div>
  );
}
