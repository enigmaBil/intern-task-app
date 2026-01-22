'use client';

import { useState } from 'react';
import { scrumNoteInteractor } from '@/core/interactors';
import { CreateScrumNoteDto, UpdateScrumNoteDto } from '@/core/domain/repositories';
import { ScrumNote } from '@/core/domain/entities';
import { DomainException } from '@/core/domain/exceptions';

export function useScrumNoteMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createScrumNote = async (data: CreateScrumNoteDto): Promise<ScrumNote | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const note = await scrumNoteInteractor.createScrumNote.execute(data);
      return note;
    } catch (err) {
      const message = err instanceof DomainException
        ? err.message
        : 'Erreur lors de la création de la note';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createScrumNote,
    isLoading,
    error,
  };
}
