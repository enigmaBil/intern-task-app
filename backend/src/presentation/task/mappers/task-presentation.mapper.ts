import { Task } from '@/core/domain/entities/task.entity';
import { TaskResponseDto } from '../dto';

/**
 * Mapper pour convertir entre les entités Task (Domain)
 * et les DTOs de présentation (API)
 * 
 * Responsabilité : Transformation des données entre les couches
 */
export class TaskPresentationMapper {
  /**
   * Convertit une entité Task (domain) vers un DTO de réponse (presentation)
   * 
   * @param task - Entité Task du domaine
   * @returns DTO pour la réponse API
   */
  static toDto(task: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = task.id;
    dto.title = task.title;
    dto.description = task.description;
    dto.status = task.status;
    dto.creatorId = task.creatorId;
    dto.assigneeId = task.assigneeId;
    dto.deadline = task.deadline;
    dto.createdAt = task.createdAt;
    dto.updatedAt = task.updatedAt;
    return dto;
  }

  /**
   * Convertit une liste d'entités Task vers une liste de DTOs
   * 
   * @param tasks - Liste d'entités Task
   * @returns Liste de DTOs
   */
  static toDtoList(tasks: Task[]): TaskResponseDto[] {
    return tasks.map((task) => this.toDto(task));
  }
}
