'use client';

import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { cn } from '@/shared/utils';
import { Calendar, MoreHorizontal, Eye, Pencil, Trash2, UserCheck, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { useAuth } from '@/presentation/hooks';
import { TaskDetailsModal, EditTaskModal, AssignTaskModal } from '@/presentation/components/modals';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { toast } from 'sonner';

interface TaskListViewProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export function TaskListView({ tasks, onTaskUpdated }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune tâche trouvée</p>
      </div>
    );
  }

  // Grouper par statut
  const groupedTasks = {
    [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE),
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null;
        
        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <StatusIcon status={status as TaskStatus} />
              <h3 className="font-semibold text-gray-700">
                {TaskStatusLabels[status as TaskStatus]}
              </h3>
              <span className="text-sm text-gray-400">({statusTasks.length})</span>
            </div>
            <div className="space-y-2">
              {statusTasks.map((task) => (
                <TaskListItem key={task.id} task={task} onTaskUpdated={onTaskUpdated} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case TaskStatus.TODO:
      return <Circle className="h-4 w-4 text-gray-400" />;
    case TaskStatus.IN_PROGRESS:
      return <Clock className="h-4 w-4 text-blue-500" />;
    case TaskStatus.DONE:
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
}

function TaskListItem({ task, onTaskUpdated }: { task: Task; onTaskUpdated?: () => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { deleteTask } = useTaskMutations();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    const success = await deleteTask(task.id);
    if (success) {
      toast.success('Tâche supprimée');
      onTaskUpdated?.();
    }
    setDeleteOpen(false);
  };

  const getDeadlineStatus = () => {
    if (!task.deadline) return null;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'urgent';
    return 'normal';
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <>
      <div
        onClick={() => setDetailsOpen(true)}
        className={cn(
          'flex items-center gap-4 p-3 sm:p-4 rounded-lg border bg-white cursor-pointer',
          'hover:shadow-md transition-all duration-200',
          'group'
        )}
      >
        {/* Icône statut */}
        <div className="flex-shrink-0">
          <StatusIcon status={task.status} />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'font-medium text-gray-900 truncate',
              task.status === TaskStatus.DONE && 'line-through text-gray-500'
            )}>
              {task.title}
            </h4>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className={cn(
            'hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs',
            deadlineStatus === 'overdue' && 'bg-red-100 text-red-700',
            deadlineStatus === 'urgent' && 'bg-orange-100 text-orange-700',
            deadlineStatus === 'normal' && 'bg-gray-100 text-gray-600'
          )}>
            <Calendar className="h-3 w-3" />
            {new Date(task.deadline).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}

        {/* Badge statut */}
        <span className={cn(
          'hidden md:inline-flex px-2 py-1 rounded-full text-xs font-medium',
          task.status === TaskStatus.TODO && 'bg-gray-100 text-gray-700',
          task.status === TaskStatus.IN_PROGRESS && 'bg-blue-100 text-blue-700',
          task.status === TaskStatus.DONE && 'bg-green-100 text-green-700'
        )}>
          {TaskStatusLabels[task.status]}
        </span>

        {/* Menu actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

      {/* Modales */}
      <TaskDetailsModal
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
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
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
