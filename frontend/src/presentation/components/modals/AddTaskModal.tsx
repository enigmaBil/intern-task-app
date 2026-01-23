'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
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
import { taskInteractor } from '@/core/interactors/task.interactor';
import { createTaskSchema, type CreateTaskFormData } from '@/shared/validation';

interface AddTaskModalProps {
  onTaskAdded?: () => void;
}

/**
 * Modal réutilisable pour ajouter une tâche
 */
export function AddTaskModal({ onTaskAdded }: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsLoading(true);

    try {
      const taskData = {
        title: data.title,
        description: data.description,
        ...(data.deadline && { deadline: new Date(data.deadline).toISOString() }),
      };

      await taskInteractor.createTask.execute(taskData);
      
      toast.success('Tâche créée avec succès', {
        description: `"${data.title}" a été ajoutée`,
      });
      
      setOpen(false);
      reset();
      onTaskAdded?.();
    } catch (error) {
      console.error('Error creating task:', error);
      
      let errorDescription = 'Impossible de créer la tâche';
      
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
          Nouvelle tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle tâche</DialogTitle>
          <DialogDescription>
            Remplissez les informations de la tâche. Cliquez sur sauvegarder quand vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <Input
              label="Titre"
              placeholder="Titre de la tâche"
              error={errors.title?.message}
              {...register('title')}
            />
            
            <Textarea
              label="Description"
              placeholder="Description détaillée"
              error={errors.description?.message}
              {...register('description')}
            />
            
            <Input
              type="date"
              label="Date limite"
              error={errors.deadline?.message}
              {...register('deadline')}
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
              {isLoading ? 'Création...' : 'Créer la tâche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
