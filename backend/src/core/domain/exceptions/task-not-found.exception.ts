/**
 * Exception levée lorsqu'une tâche n'est pas trouvée
 * 
 * Cette exception fait partie du Domain Layer et ne doit
 * pas dépendre de frameworks externes (NestJS, Express, etc.)
 */
export class TaskNotFoundException extends Error {
  public readonly taskId: string;

  constructor(taskId: string) {
    super(`Task with id "${taskId}" not found`);
    this.name = 'TaskNotFoundException';
    this.taskId = taskId;
    
    // Necessaire pour maintenir la chaîne de prototypes correcte
    Object.setPrototypeOf(this, TaskNotFoundException.prototype);
  }
}