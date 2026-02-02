'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/presentation/hooks';
import { useAuth } from '@/presentation/hooks';
import { KanbanBoard } from '@/presentation/components/task/KanbanBoard';
import { TaskListView } from '@/presentation/components/task/TaskListView';
import { TaskTableView } from '@/presentation/components/task/TaskTableView';
import { TaskToolbar, ViewMode, FilterMode } from '@/presentation/components/task/TaskToolbar';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { AddTaskModal } from '@/presentation/components/modals';
import { TaskStatus } from '@/core/domain/enums';

export default function TasksPage() {
  const { tasks, isLoading, error, refetch, updateTaskStatus } = useTasks();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // États pour les filtres et vues
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>(TaskStatus.TODO);

  // Filtrer les tâches selon le mode de filtre et la recherche
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filtre par statut
    if (filterMode === 'completed') {
      result = result.filter((t) => t.status === TaskStatus.DONE);
    } else if (filterMode === 'incomplete') {
      result = result.filter((t) => t.status !== TaskStatus.DONE);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, filterMode, searchQuery]);

  const handleTaskAdded = () => {
    setAddModalOpen(false);
    refetch();
  };

  const handleAddTaskFromColumn = (status: TaskStatus) => {
    setDefaultStatus(status);
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Mes Tâches</h1>
      </div>

      {/* Toolbar style Notion */}
      <TaskToolbar
        viewMode={viewMode}
        filterMode={filterMode}
        searchQuery={searchQuery}
        onViewModeChange={setViewMode}
        onFilterModeChange={setFilterMode}
        onSearchChange={setSearchQuery}
        onAddTask={() => {
          setDefaultStatus(TaskStatus.TODO);
          setAddModalOpen(true);
        }}
        isAdmin={isAdmin}
      />

      {/* Contenu */}
      <div className="-mx-2 sm:mx-0">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && (
          <>
            {viewMode === 'kanban' && (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskUpdated={refetch}
                onTaskStatusChange={updateTaskStatus}
                onAddTask={isAdmin ? handleAddTaskFromColumn : undefined}
              />
            )}
            {viewMode === 'list' && (
              <TaskListView
                tasks={filteredTasks}
                onTaskUpdated={refetch}
              />
            )}
            {viewMode === 'table' && (
              <TaskTableView
                tasks={filteredTasks}
                onTaskUpdated={refetch}
              />
            )}
          </>
        )}
      </div>

      {/* Modal d'ajout */}
      <AddTaskModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}

