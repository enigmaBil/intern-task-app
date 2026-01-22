'use client';

import { ScrumNote } from '@/core/domain/entities';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScrumNoteCardProps {
  note: ScrumNote;
  onNoteUpdated?: () => void;
}

export function ScrumNoteCard({ note, onNoteUpdated }: ScrumNoteCardProps) {
  const noteDate = new Date(note.date);
  const formattedDate = noteDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Calendar className="h-4 w-4" />
        <span className="capitalize">{formattedDate}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">Ce que j'ai fait</h3>
          </div>
          <p className="text-sm text-gray-700 pl-6">{note.whatIDid}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Ce que je vais faire</h3>
          </div>
          <p className="text-sm text-gray-700 pl-6">{note.nextSteps}</p>
        </div>

        {note.blockers && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h3 className="font-semibold text-sm">Blocages</h3>
            </div>
            <p className="text-sm text-gray-700 pl-6">{note.blockers}</p>
          </div>
        )}
      </div>
    </div>
  );
}
