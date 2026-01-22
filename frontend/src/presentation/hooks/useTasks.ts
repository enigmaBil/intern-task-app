'use client';

import { useState, useEffect } from 'react';
import { taskInteractor } from '@/core/interactors';
import { Task } from '@/core/domain/entities';
import { TaskFilters } from '@/core/domain/repositories';
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

  useEffect(() => {
    fetchTasks();
  }, [JSON.stringify(filters)]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
  };
}
