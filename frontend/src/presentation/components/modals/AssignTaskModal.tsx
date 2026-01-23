'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { toast } from 'sonner';
import { taskInteractor } from '@/core/interactors/task.interactor';
import { useUsers } from '@/presentation/hooks';
import { Task } from '@/core/domain/entities';

interface AssignTaskModalProps {
  task: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTaskAssigned?: () => void;
}

/**
 * Modal pour assigner une tâche à un utilisateur
 */
export function AssignTaskModal({ task, open = false, onOpenChange, onTaskAssigned }: AssignTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(task.assigneeId || '');
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Réinitialiser la sélection quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedUserId(task.assigneeId || '');
    }
  }, [open, task.assigneeId]);

  const onSubmit = async () => {
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    setIsLoading(true);

    try {
      await taskInteractor.assignTask.execute(task.id, { assigneeId: selectedUserId });
      
      const assignedUser = users.find(u => u.id === selectedUserId);
      toast.success('Tâche assignée avec succès', {
        description: `"${task.title}" a été assignée à ${assignedUser?.firstName} ${assignedUser?.lastName}`,
      });
      
      onOpenChange?.(false);
      onTaskAssigned?.();
    } catch (error) {
      console.error('Error assigning task:', error);
      
      let errorDescription = 'Impossible d\'assigner la tâche';
      
      if (error instanceof Error) {
        if (error.message.includes('Erreur serveur:')) {
          errorDescription = error.message.replace('Erreur serveur: ', '');
        } else {
          errorDescription = error.message;
        }
      }
      
      toast.error('Erreur lors de l\'assignation', {
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assigner la tâche</DialogTitle>
          <DialogDescription>
            Choisissez un utilisateur pour assigner cette tâche.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Utilisateur
          </label>
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={isLoadingUsers || isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || isLoadingUsers || !selectedUserId}>
            {isLoading ? 'Assignation...' : 'Assigner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
