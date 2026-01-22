'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { DraggableTaskCard } from './DraggableTaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export function TaskColumn({ status, tasks, onTaskUpdated }: TaskColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[500px] flex-col rounded-lg border-2 p-4 transition-all duration-200 ${
        isOver
          ? 'bg-blue-50 border-blue-400 shadow-lg'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">{TaskStatusLabels[status]}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium">
          {columnTasks.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {columnTasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskUpdated={onTaskUpdated}
          />
        ))}
        {columnTasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Glissez une tâche ici
          </div>
        )}
      </div>
    </div>
  );
}
