import { z } from 'zod';

/**
 * Schéma de validation pour la création d'une tâche
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  
  description: z
    .string()
    .min(1, 'La description est requise')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  
  deadline: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La date limite ne peut pas être dans le passé'),
});

/**
 * Type TypeScript inféré du schéma
 */
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

/**
 * Schéma de validation pour la modification d'une tâche
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .optional(),
  
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  deadline: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La date limite ne peut pas être dans le passé'),
});

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
