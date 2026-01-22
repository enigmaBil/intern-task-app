'use client';

import { AddScrumNoteModal } from '@/presentation/components/modals';

export default function ScrumNotesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes Scrum</h1>
        <AddScrumNoteModal onNoteAdded={() => console.log('Note ajoutée')} />
      </div>
      <p className="mt-4 text-gray-600">
        Daily stand-up notes de l'équipe
      </p>
    </div>
  );
}
