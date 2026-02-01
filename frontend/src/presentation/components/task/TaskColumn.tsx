'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { SortableTaskCard } from './SortableTaskCard';
import { cn } from '@/shared/utils';
import { Plus, ListTodo, Clock, CheckCircle2 } from 'lucide-react';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  isOver?: boolean;
  onTaskUpdated?: () => void;
}

// Couleurs et icônes par statut (style Notion)
const COLUMN_CONFIG: Record<TaskStatus, { 
  icon: typeof ListTodo;
  bgColor: string;
  headerBg: string;
  borderColor: string;
  dotColor: string;
}> = {
  [TaskStatus.TODO]: {
    icon: ListTodo,
    bgColor: 'bg-gray-50/50',
    headerBg: 'bg-gray-100',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
  },
  [TaskStatus.IN_PROGRESS]: {
    icon: Clock,
    bgColor: 'bg-blue-50/30',
    headerBg: 'bg-blue-100',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  [TaskStatus.DONE]: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50/30',
    headerBg: 'bg-green-100',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
  },
};

export function TaskColumn({ status, tasks, isOver, onTaskUpdated }: TaskColumnProps) {
  const { setNodeRef, active } = useDroppable({
    id: status,
  });

  const config = COLUMN_CONFIG[status];
  const Icon = config.icon;
  const isDraggingOver = isOver && active;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border transition-all duration-300',
        'min-h-[500px]',
        config.bgColor,
        config.borderColor,
        isDraggingOver && [
          'border-primary border-2',
          'bg-primary/5',
          'shadow-lg shadow-primary/10',
          'scale-[1.02]',
        ]
      )}
    >
      {/* Header de colonne style Notion */}
      <div
        className={cn(
          'sticky top-0 z-10',
          'flex items-center justify-between',
          'px-4 py-3',
          'rounded-t-xl',
          'backdrop-blur-sm bg-white/80',
          'border-b',
          config.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
          <h2 className="font-semibold text-gray-800">{TaskStatusLabels[status]}</h2>
          <span
            className={cn(
              'ml-1 rounded-full px-2 py-0.5 text-xs font-medium',
              'bg-gray-200/80 text-gray-600'
            )}
          >
            {tasks.length}
          </span>
        </div>
        
        {/* Bouton d'ajout (optionnel) */}
        <button
          className={cn(
            'p-1.5 rounded-md',
            'text-gray-400 hover:text-gray-600',
            'hover:bg-gray-100',
            'transition-colors duration-150',
            'opacity-0 group-hover:opacity-100'
          )}
          aria-label="Ajouter une tâche"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Zone de contenu avec scroll */}
      <div
        className={cn(
          'flex-1 p-3 space-y-3',
          'overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
        )}
      >
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            task={task}
            onTaskUpdated={onTaskUpdated}
          />
        ))}

        {/* Placeholder quand la colonne est vide */}
        {tasks.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center',
              'h-40 rounded-lg',
              'border-2 border-dashed',
              isDraggingOver ? 'border-primary bg-primary/5' : 'border-gray-200',
              'transition-all duration-200'
            )}
          >
            <Icon
              className={cn(
                'h-8 w-8 mb-2',
                isDraggingOver ? 'text-primary' : 'text-gray-300'
              )}
            />
            <p
              className={cn(
                'text-sm',
                isDraggingOver ? 'text-primary font-medium' : 'text-gray-400'
              )}
            >
              {isDraggingOver ? 'Déposer ici' : 'Aucune tâche'}
            </p>
          </div>
        )}

        {/* Indicateur de drop quand on survole avec une tâche */}
        {isDraggingOver && tasks.length > 0 && (
          <div
            className={cn(
              'h-20 rounded-lg',
              'border-2 border-dashed border-primary',
              'bg-primary/5',
              'flex items-center justify-center',
              'animate-pulse'
            )}
          >
            <p className="text-sm text-primary font-medium">Déposer ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
