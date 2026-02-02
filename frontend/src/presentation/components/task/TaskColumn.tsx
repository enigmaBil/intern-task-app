'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { SortableTaskCard } from './SortableTaskCard';
import { cn } from '@/shared/utils';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  isOver?: boolean;
  onTaskUpdated?: () => void;
  onAddTask?: (status: TaskStatus) => void;
}

// Configuration des couleurs par statut (style Notion - couleurs douces)
const STATUS_CONFIG: Record<TaskStatus, {
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  columnBg: string;
  cardBg: string;
  accentColor: string;
}> = {
  [TaskStatus.TODO]: {
    badgeBg: 'bg-gray-200',
    badgeText: 'text-gray-700',
    dotColor: 'bg-gray-400',
    columnBg: 'bg-gray-50',
    cardBg: 'bg-gray-100',
    accentColor: 'text-gray-500 border-gray-300 hover:bg-gray-100',
  },
  [TaskStatus.IN_PROGRESS]: {
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    dotColor: 'bg-blue-400',
    columnBg: 'bg-blue-50/50',
    cardBg: 'bg-blue-100',
    accentColor: 'text-blue-500 border-blue-300 hover:bg-blue-50',
  },
  [TaskStatus.DONE]: {
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    dotColor: 'bg-green-400',
    columnBg: 'bg-green-50/50',
    cardBg: 'bg-green-100',
    accentColor: 'text-green-500 border-green-300 hover:bg-green-50',
  },
};

// Export pour utilisation dans les cartes
export { STATUS_CONFIG };

export function TaskColumn({ status, tasks, isOver, onTaskUpdated, onAddTask }: TaskColumnProps) {
  const { setNodeRef, active } = useDroppable({
    id: status,
  });

  const config = STATUS_CONFIG[status];
  const isDraggingOver = isOver && active;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl transition-all duration-300',
        'min-h-[300px] md:min-h-[500px] p-2',
        config.columnBg,
        isDraggingOver && [
          'ring-2 ring-primary ring-offset-2',
          'bg-primary/5',
        ]
      )}
    >
      {/* Header avec badge coloré style Notion */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2">
          {/* Badge de statut coloré */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium',
              config.badgeBg,
              config.badgeText
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', config.dotColor, 'bg-current opacity-80')} />
            {TaskStatusLabels[status]}
          </span>
          
          {/* Compteur */}
          <span className="text-sm text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Zone de contenu avec scroll */}
      <div
        className={cn(
          'flex-1 px-2 pb-2 space-y-2',
          'overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
        )}
      >
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onTaskUpdated={onTaskUpdated}
            cardBgColor={config.cardBg}
          />
        ))}

        {/* Placeholder quand la colonne est vide */}
        {tasks.length === 0 && !isDraggingOver && (
          <div
            className={cn(
              'flex items-center justify-center',
              'h-24 rounded-lg',
              'border border-dashed border-gray-300',
              'text-sm text-muted-foreground'
            )}
          >
            Aucune tâche
          </div>
        )}

        {/* Indicateur de drop */}
        {isDraggingOver && (
          <div
            className={cn(
              'h-16 rounded-lg',
              'border-2 border-dashed border-primary',
              'bg-primary/10',
              'flex items-center justify-center',
              'animate-pulse'
            )}
          >
            <span className="text-sm text-primary font-medium">Déposer ici</span>
          </div>
        )}
      </div>

      {/* Bouton Nouvelle tâche en bas (style Notion) */}
      {onAddTask && (
        <button
          onClick={() => onAddTask(status)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 mx-2 mb-2',
            'text-sm font-medium',
            'rounded-md border',
            'transition-colors duration-150',
            config.accentColor
          )}
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </button>
      )}
    </div>
  );
}
