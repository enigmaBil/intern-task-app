'use client';

import { useTasks } from '@/presentation/hooks';
import { KanbanBoard } from '@/presentation/components/task/KanbanBoard';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';

export default function TasksPage() {
  const { tasks, isLoading, error, refetch } = useTasks();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tâches</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nouvelle tâche
        </button>
      </div>
      <p className="mt-4 text-gray-600">
        Tableau Kanban de gestion des tâches
      </p>

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && <KanbanBoard tasks={tasks} />}
      </div>
    </div>
  );
}

