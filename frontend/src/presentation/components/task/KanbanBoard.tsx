'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { Task } from '@/core/domain/entities';
import { TaskStatus } from '@/core/domain/enums';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { toast } from 'sonner';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export function KanbanBoard({ tasks, onTaskUpdated }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const { updateTask } = useTaskMutations();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px de mouvement avant d'activer le drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    
    // Vérifier que c'est bien un changement de statut
    if (!task || task.status === newStatus) {
      return; // Pas de changement de statut, on ne fait rien
    }

    // Mise à jour backend uniquement si changement de statut
    const updatedTask = await updateTask(taskId, { status: newStatus });

    if (updatedTask) {
      toast.success('Tâche déplacée', {
        description: `La tâche a été déplacée vers ${getStatusLabel(newStatus)}`,
      });
      onTaskUpdated?.();
    } else {
      toast.error('Erreur lors du déplacement');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TaskColumn
          status={TaskStatus.TODO}
          tasks={tasks}
          onTaskUpdated={onTaskUpdated}
        />
        <TaskColumn
          status={TaskStatus.IN_PROGRESS}
          tasks={tasks}
          onTaskUpdated={onTaskUpdated}
        />
        <TaskColumn
          status={TaskStatus.DONE}
          tasks={tasks}
          onTaskUpdated={onTaskUpdated}
        />
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'À faire',
    [TaskStatus.IN_PROGRESS]: 'En cours',
    [TaskStatus.DONE]: 'Terminé',
  };
  return labels[status];
}
