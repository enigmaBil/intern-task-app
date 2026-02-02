'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/core/domain/entities';
import { TaskCard } from './TaskCard';
import { cn } from '@/shared/utils';

interface SortableTaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onTaskUpdated?: () => void;
  cardBgColor?: string;
}

export const SortableTaskCard = memo(function SortableTaskCard({
  task,
  isOverlay = false,
  onTaskUpdated,
  cardBgColor,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Style spécial pour l'overlay (la carte fantôme pendant le drag)
  if (isOverlay) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-primary/30 bg-white shadow-2xl',
          'rotate-[2deg] scale-[1.02]',
          'ring-2 ring-primary/20',
          'cursor-grabbing'
        )}
        style={{
          width: '280px',
        }}
      >
        <TaskCard task={task} isDragging cardBgColor={cardBgColor} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-manipulation',
        'transition-opacity duration-150',
        'cursor-grab active:cursor-grabbing',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        'rounded-lg',
        isDragging && 'opacity-40 scale-[0.98]'
      )}
    >
      <TaskCard task={task} onTaskUpdated={onTaskUpdated} isDragging={isDragging} cardBgColor={cardBgColor} />
    </div>
  );
});
