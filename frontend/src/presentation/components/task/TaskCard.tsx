'use client';

import { Task } from '@/core/domain/entities';
import { TaskStatusLabels } from '@/core/domain/enums';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{task.title}</h3>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {TaskStatusLabels[task.status]}
        </span>
        
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Éditer
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
