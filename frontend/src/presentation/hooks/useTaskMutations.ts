'use client';

import { useState } from 'react';
import { taskInteractor } from '@/core/interactors';
import { CreateTaskDto, UpdateTaskDto } from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';
import { DomainException } from '@/core/domain/exceptions';

export function useTaskMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: CreateTaskDto): Promise<Task | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const task = await taskInteractor.createTask.execute(data);
      return task;
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors de la création de la tâche';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, data: UpdateTaskDto): Promise<Task | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const task = await taskInteractor.updateTask.execute(id, data);
      return task;
    } catch (err) {
      // Préserver le message d'erreur original pour permettre un traitement personnalisé
      const message = err instanceof Error 
        ? err.message 
        : (err instanceof DomainException ? err.message : 'Erreur lors de la mise à jour de la tâche');
      setError(message);
      // Propager l'erreur avec le message original
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await taskInteractor.deleteTask.execute(id);
      return true;
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors de la suppression de la tâche';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    isLoading,
    error,
  };
}
