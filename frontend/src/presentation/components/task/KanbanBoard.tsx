'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/core/domain/entities';
import { TaskStatus } from '@/core/domain/enums';
import { TaskColumn } from './TaskColumn';
import { SortableTaskCard } from './SortableTaskCard';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_ORDER = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as const;

export function KanbanBoard({ tasks, onTaskUpdated, onTaskStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const { updateTask } = useTaskMutations();

  // Organiser les tâches par colonne
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };
    
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    
    return grouped;
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeId),
    [activeId, tasks]
  );

  // Sensors optimisés - activation immédiate pour un drag fluide
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Très faible distance pour activation rapide
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Délai court pour mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Configuration du measuring pour de meilleures performances
  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const findContainer = useCallback(
    (id: UniqueIdentifier): TaskStatus | null => {
      // Si l'id est un statut, c'est une colonne
      if (STATUS_ORDER.includes(id as TaskStatus)) {
        return id as TaskStatus;
      }
      
      // Sinon, chercher la tâche
      const task = tasks.find((t) => t.id === id);
      return task?.status ?? null;
    },
    [tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    document.body.style.cursor = 'grabbing';
    document.body.classList.add('dragging');
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      
      setActiveId(null);
      setOverId(null);
      document.body.style.cursor = '';
      document.body.classList.remove('dragging');

      if (!over) return;

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (!activeContainer || !overContainer) return;

      // Si la tâche change de colonne
      if (activeContainer !== overContainer) {
        const taskId = active.id as string;
        const newStatus = overContainer;
        const originalTask = tasks.find(t => t.id === taskId);

        if (!originalTask) return;

        // 1. Mise à jour optimiste immédiate (pas de rechargement)
        onTaskStatusChange?.(taskId, newStatus);

        // 2. Appel API en arrière-plan
        try {
          const result = await updateTask(taskId, { status: newStatus });
          
          if (result) {
            toast.success('Tâche déplacée', {
              description: `Vers ${getStatusLabel(newStatus)}`,
              duration: 1500,
            });
          } else {
            // Rollback si échec
            onTaskStatusChange?.(taskId, originalTask.status);
            toast.error('Erreur lors du déplacement');
          }
        } catch {
          // Rollback si erreur
          onTaskStatusChange?.(taskId, originalTask.status);
          toast.error('Erreur lors du déplacement');
        }
      }
    },
    [findContainer, updateTask, onTaskStatusChange, tasks]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    document.body.style.cursor = '';
    document.body.classList.remove('dragging');
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-4 md:gap-6 md:grid-cols-3 min-h-[calc(100vh-200px)]">
        {STATUS_ORDER.map((status) => (
          <SortableContext
            key={status}
            items={tasksByStatus[status].map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <TaskColumn
              status={status}
              tasks={tasksByStatus[status]}
              isOver={overId === status}
              onTaskUpdated={onTaskUpdated}
            />
          </SortableContext>
        ))}
      </div>

      {/* Drag Overlay */}
      {typeof window !== 'undefined' &&
        createPortal(
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeTask ? (
              <SortableTaskCard
                task={activeTask}
                isOverlay
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
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
