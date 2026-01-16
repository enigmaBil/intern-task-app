import { TaskStatus } from "../enums/task-status.enum";

/**
 * Exception levée lorsqu'une transition de statut invalide est tentée
 */
export class InvalidTaskTransitionException extends Error {
  public readonly fromStatus: TaskStatus;
  public readonly toStatus: TaskStatus;

  constructor(fromStatus: TaskStatus, toStatus: TaskStatus) {
    super(
      `Invalid task status transition from "${fromStatus}" to "${toStatus}"`
    );
    this.name = 'InvalidTaskTransitionException';
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    
    Object.setPrototypeOf(this, InvalidTaskTransitionException.prototype);
  }
}