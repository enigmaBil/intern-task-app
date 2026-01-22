export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'À faire',
  [TaskStatus.IN_PROGRESS]: 'En cours',
  [TaskStatus.DONE]: 'Terminé',
};
