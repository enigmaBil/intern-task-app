import { 
  ITaskRepository, 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskFilters 
} from '@/core/domain/repositories';
import { Task } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';
import { httpClient } from '../http';
import { API_CONFIG } from '@/shared/constants';

export class TaskRepository implements ITaskRepository {
  private readonly endpoint = API_CONFIG.ENDPOINTS.TASKS;

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.creatorId) params.append('creatorId', filters.creatorId);

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    const response = await httpClient.get<Task[]>(url);
    
    return response.data.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const response = await httpClient.get<Task>(`${this.endpoint}/${id}`);
      
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await httpClient.post<Task>(this.endpoint, data);
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await httpClient.patch<Task>(`${this.endpoint}/${id}`, data);
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }
}
