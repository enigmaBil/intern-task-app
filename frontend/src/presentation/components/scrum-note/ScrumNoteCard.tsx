'use client';

import { useState } from 'react';
import { ScrumNote } from '@/core/domain/entities';
import { Calendar, CheckCircle2, AlertCircle, MoreVertical, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Button } from '@/presentation/components/ui/button';
import { EditScrumNoteModal, DeleteScrumNoteDialog } from '@/presentation/components/modals';
import { useAuth } from '@/presentation/hooks/useAuth';

interface ScrumNoteCardProps {
  note: ScrumNote;
  onNoteUpdated?: () => void;
}

export function ScrumNoteCard({ note, onNoteUpdated }: ScrumNoteCardProps) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const noteDate = new Date(note.date);
  const formattedDate = noteDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // User can edit/delete their own notes or if they are ADMIN
  const canModify = user && (user.id === note.userId || user.role === 'ADMIN');

  const handleSuccess = () => {
    if (onNoteUpdated) {
      onNoteUpdated();
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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

      <EditScrumNoteModal
        note={note}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleSuccess}
      />

      <DeleteScrumNoteDialog
        noteId={note.id}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
