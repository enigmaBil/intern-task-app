'use client';

import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface TaskActionsProps {
  task: Task;
  onDelete?: () => void;
  onEdit?: () => void;
}

/**
 * Exemple d'utilisation des AlertDialogs pour les actions sur une tâche
 */
export function TaskActions({ task, onDelete, onEdit }: TaskActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      // TODO: Appeler le use case deleteTask
      await new Promise(resolve => setTimeout(resolve, 500)); // Simuler l'API
      
      toast.success('Tâche supprimée', {
        description: `"${task.title}" a été supprimée avec succès`,
      });
      
      onDelete?.();
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de supprimer la tâche',
      });
    }
  };

  const handleEdit = () => {
    // TODO: Ouvrir le modal d'édition
    toast.info('Modification', {
      description: 'Fonctionnalité en cours de développement',
    });
    onEdit?.();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="gap-2"
      >
        <Edit className="h-4 w-4" />
        Modifier
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteDialogOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
