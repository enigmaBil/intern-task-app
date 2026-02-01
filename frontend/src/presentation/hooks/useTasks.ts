'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskInteractor } from '@/core/interactors';
import { Task } from '@/core/domain/entities';
import { TaskFilters } from '@/core/domain/repositories';
import { TaskStatus } from '@/core/domain/enums';
import { DomainException } from '@/core/domain/exceptions';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskInteractor.getAllTasks.execute(filters);
      setTasks(data);
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors du chargement des tâches';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mise à jour optimiste du statut d'une tâche
  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }, []);

  // Mise à jour optimiste complète d'une tâche
  const updateTaskOptimistically = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  // Annuler la mise à jour optimiste (rollback)
  const rollbackTask = useCallback((taskId: string, originalTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? originalTask : task
      )
    );
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [JSON.stringify(filters)]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
    updateTaskOptimistically,
    rollbackTask,
  };
}
