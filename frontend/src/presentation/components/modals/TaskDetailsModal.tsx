'use client';

import { Task } from '@/core/domain/entities';
import { TaskStatusLabels } from '@/core/domain/enums';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Calendar, User, Clock } from 'lucide-react';
import { useUsers } from '@/presentation/hooks';

interface TaskDetailsModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal pour afficher les détails d'une tâche
 */
export function TaskDetailsModal({ task, open, onOpenChange }: TaskDetailsModalProps) {
  const { users } = useUsers();
  const assignedUser = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Détails complets de la tâche
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Statut
            </h3>
            <p className="text-sm text-gray-700 pl-4">{TaskStatusLabels[task.status]}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date limite
              </h3>
              <p className="text-sm text-gray-700 pl-6">
                {new Date(task.deadline).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Modifiée le {new Date(task.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {assignedUser && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>Assignée à: {assignedUser.firstName} {assignedUser.lastName}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
