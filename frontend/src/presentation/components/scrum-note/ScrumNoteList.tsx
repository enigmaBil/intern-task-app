'use client';

import { ScrumNote } from '@/core/domain/entities';
import { ScrumNoteCard } from './ScrumNoteCard';

interface ScrumNoteListProps {
  notes: ScrumNote[];
  onNoteUpdated?: () => void;
}

export function ScrumNoteList({ notes, onNoteUpdated }: ScrumNoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune note scrum pour le moment</p>
        <p className="text-sm text-gray-400 mt-2">Ajoutez votre première note quotidienne</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <ScrumNoteCard key={note.id} note={note} onNoteUpdated={onNoteUpdated} />
      ))}
    </div>
  );
}
