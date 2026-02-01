'use client';

import { useTasks } from '@/presentation/hooks';
import { useAuth } from '@/presentation/hooks';
import { KanbanBoard } from '@/presentation/components/task/KanbanBoard';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { AddTaskModal } from '@/presentation/components/modals';

export default function TasksPage() {
  const { tasks, isLoading, error, refetch, updateTaskStatus } = useTasks();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tâches</h1>
        {isAdmin && <AddTaskModal onTaskAdded={refetch} />}
      </div>
      <p className="mt-4 text-gray-600">
        Tableau Kanban de gestion des tâches
      </p>

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && (
          <KanbanBoard 
            tasks={tasks} 
            onTaskUpdated={refetch}
            onTaskStatusChange={updateTaskStatus}
          />
        )}
      </div>
    </div>
  );
}

