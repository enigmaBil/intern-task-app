'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import { updateTaskSchema, type UpdateTaskFormData } from '@/shared/validation';
import { Task } from '@/core/domain/entities';

interface EditTaskModalProps {
  task: Task;
  onTaskUpdated?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Modal réutilisable pour modifier une tâche
 */
export function EditTaskModal({ task, onTaskUpdated, trigger, open: controlledOpen, onOpenChange }: EditTaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Utiliser le state contrôlé si fourni, sinon utiliser le state interne
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    },
  });

  // Réinitialiser le formulaire quand la tâche change
  useEffect(() => {
    reset({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    });
  }, [task, reset]);

  const onSubmit = async (data: UpdateTaskFormData) => {
    setIsLoading(true);

    try {
      const taskData = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.deadline && { deadline: new Date(data.deadline).toISOString() }),
      };

      await taskInteractor.updateTask.execute(task.id, taskData);
      
      toast.success('Tâche modifiée avec succès', {
        description: `"${data.title || task.title}" a été mise à jour`,
      });
      
      setOpen(false);
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error updating task:', error);
      
      let errorDescription = 'Impossible de modifier la tâche';
      
      if (error instanceof Error) {
        if (error.message.includes('Erreur serveur:')) {
          errorDescription = error.message.replace('Erreur serveur: ', '');
        } else {
          errorDescription = error.message;
        }
      }
      
      toast.error('Erreur lors de la modification', {
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la tâche. Cliquez sur sauvegarder quand vous avez terminé.
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
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
