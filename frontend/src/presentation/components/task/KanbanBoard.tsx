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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const STATUS_ORDER = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as const;

export function KanbanBoard({ tasks, onTaskUpdated, onTaskStatusChange, onAddTask }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [transitionError, setTransitionError] = useState<{
    from: TaskStatus;
    to: TaskStatus;
  } | null>(null);
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
          await updateTask(taskId, { status: newStatus });
          
          toast.success('Tâche déplacée', {
            description: `Vers ${getStatusLabel(newStatus)}`,
            duration: 1500,
          });
        } catch (err) {
          // Rollback si erreur
          onTaskStatusChange?.(taskId, originalTask.status);
          
          // Message d'erreur personnalisé selon la transition
          const errorMessage = err instanceof Error ? err.message : '';
          
          if (errorMessage.includes('Invalid task status transition')) {
            // Afficher un AlertDialog pour les erreurs de transition
            setTransitionError({
              from: originalTask.status,
              to: newStatus,
            });
          } else {
            toast.error('Erreur lors du déplacement', {
              description: errorMessage || 'Une erreur est survenue',
            });
          }
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
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-h-[calc(100vh-200px)] overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <SortableContext
            key={status}
            items={tasksByStatus[status].map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full md:flex-1 md:min-w-[280px] md:max-w-[350px]">
              <TaskColumn
                status={status}
                tasks={tasksByStatus[status]}
                isOver={overId === status}
                onTaskUpdated={onTaskUpdated}
                onAddTask={onAddTask}
              />
            </div>
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

    {/* Alert Dialog pour les erreurs de transition */}
    <AlertDialog open={!!transitionError} onOpenChange={() => setTransitionError(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <AlertDialogTitle>Transition impossible</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {transitionError && (
              <>
                Impossible de passer une tâche de <strong>&quot;{getStatusLabel(transitionError.from)}&quot;</strong> à <strong>&quot;{getStatusLabel(transitionError.to)}&quot;</strong>.
                <br /><br />
                Une tâche terminée doit d&apos;abord repasser par &quot;En cours&quot; avant de pouvoir être remise à faire.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setTransitionError(null)}>
            Compris
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
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
