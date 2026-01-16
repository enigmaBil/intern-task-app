/**
 * Enum représentant les différents statuts d'une tâche
 * dans le cycle de vie du board Kanban
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/**
 * Vérifie si une valeur est un TaskStatus valide
 */
export function isValidTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

/**
 * Retourne tous les statuts disponibles
 */
export function getAllTaskStatuses(): TaskStatus[] {
  return Object.values(TaskStatus);
}