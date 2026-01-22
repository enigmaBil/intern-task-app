import { 
  IScrumNoteRepository, 
  CreateScrumNoteDto, 
  UpdateScrumNoteDto 
} from '@/core/domain/repositories';
import { ScrumNote } from '@/core/domain/entities';
import { NotFoundException } from '@/core/domain/exceptions';
import { httpClient } from '../http';
import { API_CONFIG } from '@/shared/constants';

export class ScrumNoteRepository implements IScrumNoteRepository {
  private readonly endpoint = API_CONFIG.ENDPOINTS.SCRUM_NOTES;

  async findAll(userId?: string): Promise<ScrumNote[]> {
    const url = userId ? `${this.endpoint}?userId=${userId}` : this.endpoint;
    const response = await httpClient.get<ScrumNote[]>(url);
    
    return response.data.map(note => ({
      ...note,
      date: new Date(note.date),
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  }

  async findById(id: string): Promise<ScrumNote | null> {
    try {
      const response = await httpClient.get<ScrumNote>(`${this.endpoint}/${id}`);
      
      return {
        ...response.data,
        date: new Date(response.data.date),
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

  async findByUserAndDate(userId: string, date: Date): Promise<ScrumNote | null> {
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await httpClient.get<ScrumNote>(
        `${this.endpoint}/user/${userId}/date/${dateString}`
      );
      
      return {
        ...response.data,
        date: new Date(response.data.date),
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

  async create(data: CreateScrumNoteDto): Promise<ScrumNote> {
    const response = await httpClient.post<ScrumNote>(this.endpoint, data);
    
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async update(id: string, data: UpdateScrumNoteDto): Promise<ScrumNote> {
    const response = await httpClient.patch<ScrumNote>(`${this.endpoint}/${id}`, data);
    
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }
}
