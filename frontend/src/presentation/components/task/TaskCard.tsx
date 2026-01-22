'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { Task } from '@/core/domain/entities';
import { TaskStatusLabels } from '@/core/domain/enums';
import { EditTaskModal, TaskDetailsModal } from '@/presentation/components/modals';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onTaskUpdated?: () => void;
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { deleteTask, isLoading } = useTaskMutations();

  const handleDelete = async () => {
    const success = await deleteTask(task.id);
    if (success) {
      toast.success('Tâche supprimée', {
        description: `"${task.title}" a été supprimée`,
      });
      onTaskUpdated?.();
    } else {
      toast.error('Erreur lors de la suppression');
    }
    setDeleteOpen(false);
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold flex-1">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Mettre à jour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Afficher détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
      
      {task.deadline && (
        <p className="mt-2 text-xs text-gray-500">
          Échéance: {new Date(task.deadline).toLocaleDateString('fr-FR')}
        </p>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {TaskStatusLabels[task.status]}
        </span>
      </div>

      <EditTaskModal
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onTaskUpdated={onTaskUpdated}
      />

      <TaskDetailsModal
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer la tâche"
        description={`Êtes-vous sûr de vouloir supprimer "${task.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
