'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import { toast } from 'sonner';
import { scrumNoteInteractor } from '@/core/interactors/scrum-note.interactor';
import { createScrumNoteSchema, type CreateScrumNoteFormData } from '@/shared/validation';

interface AddScrumNoteModalProps {
  onNoteAdded?: () => void;
}

/**
 * Modal réutilisable pour ajouter une note scrum
 */
export function AddScrumNoteModal({ onNoteAdded }: AddScrumNoteModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateScrumNoteFormData>({
    resolver: zodResolver(createScrumNoteSchema),
    defaultValues: {
      whatIDid: '',
      nextSteps: '',
      blockers: '',
    },
  });

  const onSubmit = async (data: CreateScrumNoteFormData) => {
    setIsLoading(true);

    try {
      await scrumNoteInteractor.createScrumNote.execute(data);
      
      toast.success('Note scrum créée avec succès', {
        description: 'Votre note quotidienne a été enregistrée',
      });
      
      setOpen(false);
      reset();
      onNoteAdded?.();
    } catch (error) {
      console.error('Error creating scrum note:', error);
      
      let errorDescription = 'Impossible de créer la note scrum';
      
      if (error instanceof Error) {
        if (error.message.includes('Erreur serveur:')) {
          errorDescription = error.message.replace('Erreur serveur: ', '');
        } else {
          errorDescription = error.message;
        }
      }
      
      toast.error('Erreur lors de la création', {
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle note scrum
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Créer une note scrum</DialogTitle>
          <DialogDescription>
            Renseignez votre rapport quotidien. Cliquez sur sauvegarder quand vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <Textarea
              label="Ce que j'ai fait aujourd'hui"
              placeholder="Décrivez ce que vous avez accompli..."
              required
              error={errors.whatIDid?.message}
              {...register('whatIDid')}
            />
            
            <Textarea
              label="Ce que je vais faire demain"
              placeholder="Planifiez vos tâches de demain..."
              required
              error={errors.nextSteps?.message}
              {...register('nextSteps')}
            />
            
            <Textarea
              label="Blocages / Difficultés"
              placeholder="Décrivez vos blocages (optionnel)"
              className="min-h-[60px]"
              error={errors.blockers?.message}
              {...register('blockers')}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
