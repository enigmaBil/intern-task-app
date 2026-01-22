'use client';

import { useDraggable } from '@dnd-kit/core';
import { Task } from '@/core/domain/entities';
import { TaskCard } from './TaskCard';
import { GripVertical } from 'lucide-react';

interface DraggableTaskCardProps {
  task: Task;
  onTaskUpdated?: () => void;
}

export function DraggableTaskCard({ task, onTaskUpdated }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
    setActivatorNodeRef,
  } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.3 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Zone de drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-white rounded shadow-sm"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <TaskCard task={task} onTaskUpdated={onTaskUpdated} />
    </div>
  );
}
