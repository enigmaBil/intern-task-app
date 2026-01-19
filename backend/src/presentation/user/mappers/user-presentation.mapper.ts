import { User } from '@/core/domain/entities/user.entity';
import { UserResponseDto } from '../dto';

/**
 * Mapper pour convertir entre les entités User (Domain)
 * et les DTOs de présentation (API)
 * 
 * Responsabilité : Transformation des données entre les couches
 */
export class UserPresentationMapper {
  /**
   * Convertit une entité User (domain) vers un DTO de réponse (presentation)
   * 
   * @param user - Entité User du domaine
   * @returns DTO pour la réponse API
   */
  static toDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  /**
   * Convertit une liste d'entités User vers une liste de DTOs
   * 
   * @param users - Liste d'entités User
   * @returns Liste de DTOs
   */
  static toDtoList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toDto(user));
  }
}
