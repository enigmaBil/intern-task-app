'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import { ScrumNote } from '@/core/domain/entities';
import { scrumNoteInteractor } from '@/core/interactors/scrum-note.interactor';
import { toast } from 'sonner';

interface EditScrumNoteModalProps {
  note: ScrumNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditScrumNoteModal({
  note,
  open,
  onOpenChange,
  onSuccess,
}: EditScrumNoteModalProps) {
  const [whatIDid, setWhatIDid] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [blockers, setBlockers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when note changes or modal opens
  useEffect(() => {
    if (note && open) {
      setWhatIDid(note.whatIDid);
      setNextSteps(note.nextSteps);
      setBlockers(note.blockers || '');
    }
  }, [note, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;

    if (!whatIDid.trim() || !nextSteps.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      await scrumNoteInteractor.updateScrumNote.execute(note.id, {
        whatIDid: whatIDid.trim(),
        nextSteps: nextSteps.trim(),
        blockers: blockers.trim() || undefined,
      });

      toast.success('Note mise à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating scrum note:', error);
      toast.error('Erreur lors de la mise à jour de la note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la note scrum</DialogTitle>
          <DialogDescription>
            Modifiez les détails de votre note quotidienne
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="whatIDid" className="text-sm font-medium">
              Ce que j'ai fait <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="whatIDid"
              value={whatIDid}
              onChange={(e) => setWhatIDid(e.target.value)}
              placeholder="Décrivez ce que vous avez accompli aujourd'hui"
              required
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="nextSteps" className="text-sm font-medium">
              Prochaines étapes <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Ce que vous prévoyez de faire demain"
              required
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="blockers" className="text-sm font-medium">
              Blocages (optionnel)
            </label>
            <Textarea
              id="blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Y a-t-il des obstacles ou des problèmes ?"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
