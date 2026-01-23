import { 
  IUserRepository, 
  CreateUserDto, 
  UpdateUserDto 
} from '@/core/domain/repositories';
import { User } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';
import { httpClient } from '../http';
import { API_CONFIG } from '@/shared/constants';

export class UserRepository implements IUserRepository {
  private readonly endpoint = API_CONFIG.ENDPOINTS.USERS;

  async findAll(): Promise<User[]> {
    const response = await httpClient.get<User[]>(this.endpoint);
    
    return response.data.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await httpClient.get<User>(`${this.endpoint}/${id}`);
      
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

  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await httpClient.get<User>(`${this.endpoint}/email/${email}`);
      
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

  async create(data: CreateUserDto): Promise<User> {
    const response = await httpClient.post<User>(this.endpoint, data);
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await httpClient.patch<User>(`${this.endpoint}/${id}`, data);
    
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.post(`${this.endpoint}/${id}/deactivate`);
  }

  async activate(id: string): Promise<void> {
    await httpClient.post(`${this.endpoint}/${id}/activate`);
  }

  async sync(): Promise<{ total: number; active: number; deactivated: number }> {
    const response = await httpClient.post<{ total: number; active: number; deactivated: number }>(
      `${this.endpoint}/sync`
    );
    return response.data;
  }
}
