import { z } from 'zod';

/**
 * Schéma de validation pour la création d'une note scrum
 */
export const createScrumNoteSchema = z.object({
  whatIDid: z
    .string()
    .min(1, 'Ce champ est requis')
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères'),
  
  nextSteps: z
    .string()
    .min(1, 'Ce champ est requis')
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères'),
  
  blockers: z
    .string()
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères')
    .optional(),
});

/**
 * Type TypeScript inféré du schéma
 */
export type CreateScrumNoteFormData = z.infer<typeof createScrumNoteSchema>;

/**
 * Schéma de validation pour la modification d'une note scrum
 */
export const updateScrumNoteSchema = z.object({
  whatIDid: z
    .string()
    .min(1, 'Ce champ est requis')
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères')
    .optional(),
  
  nextSteps: z
    .string()
    .min(1, 'Ce champ est requis')
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères')
    .optional(),
  
  blockers: z
    .string()
    .max(2000, 'Le texte ne peut pas dépasser 2000 caractères')
    .optional(),
});

export type UpdateScrumNoteFormData = z.infer<typeof updateScrumNoteSchema>;
