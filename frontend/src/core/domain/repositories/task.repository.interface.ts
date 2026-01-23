import { Task } from '../entities';
import { TaskStatus } from '../enums';

export interface CreateTaskDto {
  title: string;
  description: string;
  deadline?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  assigneeId?: string;
  creatorId?: string;
}

export interface AssignTaskDto {
  assigneeId: string;
}

export interface ITaskRepository {
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(data: CreateTaskDto): Promise<Task>;
  update(id: string, data: UpdateTaskDto): Promise<Task>;
  delete(id: string): Promise<void>;
  assign(id: string, data: AssignTaskDto): Promise<Task>;
}
