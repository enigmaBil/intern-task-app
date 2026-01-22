'use client';

import { useState, useEffect } from 'react';
import { scrumNoteInteractor } from '@/core/interactors';
import { ScrumNote } from '@/core/domain/entities';
import { DomainException } from '@/core/domain/exceptions';

export function useScrumNotes(userId?: string) {
  const [scrumNotes, setScrumNotes] = useState<ScrumNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScrumNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await scrumNoteInteractor.getAllScrumNotes.execute(userId);
      setScrumNotes(data);
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors du chargement des notes scrum';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScrumNotes();
  }, [userId]);

  return {
    scrumNotes,
    isLoading,
    error,
    refetch: fetchScrumNotes,
  };
}
