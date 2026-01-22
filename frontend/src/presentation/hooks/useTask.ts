'use client';

import { useState, useEffect } from 'react';
import { taskInteractor } from '@/core/interactors';
import { Task } from '@/core/domain/entities';
import { DomainException } from '@/core/domain/exceptions';

export function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskInteractor.getTaskById.execute(id);
      setTask(data);
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors du chargement de la tâche';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
  };
}
