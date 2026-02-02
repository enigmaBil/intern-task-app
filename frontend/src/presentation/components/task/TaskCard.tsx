'use client';

import { useState, memo } from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye, UserCheck, Calendar, User } from 'lucide-react';
import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { EditTaskModal, TaskDetailsModal, AssignTaskModal } from '@/presentation/components/modals';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { useAuth } from '@/presentation/hooks';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdated?: () => void;
  isDragging?: boolean;
  cardBgColor?: string;
}

// Badge de priorité visuelle basé sur la deadline
function getDeadlineStatus(deadline: Date | null): 'overdue' | 'urgent' | 'normal' | null {
  if (!deadline) return null;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'urgent';
  return 'normal';
}

export const TaskCard = memo(function TaskCard({ task, onTaskUpdated, isDragging = false, cardBgColor }: TaskCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const { deleteTask, isLoading } = useTaskMutations();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const deadlineStatus = getDeadlineStatus(task.deadline);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas ouvrir les détails si on est en train de drag ou si on clique sur le menu
    if (isDragging) return;
    if ((e.target as HTMLElement).closest('[data-radix-collection-item]')) {
      return;
    }
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setDetailsOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'group relative',
          'rounded-lg border border-transparent',
          'p-4',
          'cursor-pointer',
          'transition-all duration-200',
          'hover:border-gray-200',
          'active:scale-[0.98]',
          // Arrière-plan dynamique selon la colonne
          cardBgColor
        )}
      >
        {/* Header avec titre et menu */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-medium text-gray-800 line-clamp-2 flex-1',
              'text-sm leading-snug',
              task.status === TaskStatus.DONE && 'line-through text-gray-500'
            )}
          >
            {task.title}
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7 shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50',
                  'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-150'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAssignOpen(true)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assigner
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description (si présente) */}
        {task.description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Badge de statut style Notion */}
        <div className="mt-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
              task.status === TaskStatus.TODO && 'bg-gray-200 text-gray-600',
              task.status === TaskStatus.IN_PROGRESS && 'bg-blue-200 text-blue-700',
              task.status === TaskStatus.DONE && 'bg-green-200 text-green-700'
            )}
          >
            <span 
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                task.status === TaskStatus.TODO && 'bg-gray-400',
                task.status === TaskStatus.IN_PROGRESS && 'bg-blue-500',
                task.status === TaskStatus.DONE && 'bg-green-500'
              )}
            />
            {task.status === TaskStatus.TODO && 'Pas commencé'}
            {task.status === TaskStatus.IN_PROGRESS && 'En cours'}
            {task.status === TaskStatus.DONE && 'Terminé'}
          </span>
        </div>

        {/* Footer avec métadonnées */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {/* Deadline */}
          {task.deadline && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                'text-xs px-2 py-0.5 rounded-md',
                deadlineStatus === 'overdue' && 'bg-red-100 text-red-600',
                deadlineStatus === 'urgent' && 'bg-orange-100 text-orange-600',
                deadlineStatus === 'normal' && 'bg-gray-200 text-gray-600'
              )}
            >
              <Calendar className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}

          {/* Assigné */}
          {task.assigneeId && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                'text-xs px-2 py-0.5 rounded-md',
                'bg-blue-50 text-blue-600'
              )}
            >
              <User className="h-3 w-3" />
              Assignée
            </span>
          )}

          {/* Heures estimées */}
          {task.estimatedHours && (
            <span className="text-xs text-gray-400">
              {task.estimatedHours}h estimées
            </span>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditTaskModal
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onTaskUpdated={onTaskUpdated}
      />

      <AssignTaskModal
        task={task}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onTaskAssigned={onTaskUpdated}
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
    </>
  );
});
