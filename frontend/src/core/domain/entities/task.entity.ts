import { TaskStatus } from '../enums';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  creatorId: string;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
