'use client';

import { useState, useEffect } from 'react';
import { userInteractor } from '@/core/interactors';
import { User } from '@/core/domain/entities';
import { DomainException } from '@/core/domain/exceptions';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userInteractor.getAllUsers.execute();
      setUsers(data);
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors du chargement des utilisateurs';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
