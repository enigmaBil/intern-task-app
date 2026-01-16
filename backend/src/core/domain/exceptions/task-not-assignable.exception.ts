/**
 * Exception levée lorsqu'une tâche ne peut pas être assignée
 * pour des raisons métier (règles de gestion)
 */
export class TaskNotAssignableException extends Error {
  public readonly taskId: string;
  public readonly reason: string;

  constructor(taskId: string, reason: string) {
    super(`Task "${taskId}" cannot be assigned: ${reason}`);
    this.name = 'TaskNotAssignableException';
    this.taskId = taskId;
    this.reason = reason;
    
    Object.setPrototypeOf(this, TaskNotAssignableException.prototype);
  }
}