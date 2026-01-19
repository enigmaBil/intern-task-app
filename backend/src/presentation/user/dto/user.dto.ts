import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@/core/domain/enums/user-role.enum';

/**
 * DTO pour la création d'un utilisateur (usage interne/admin uniquement)
 * La synchronisation depuis Keycloak utilise un use-case dédié
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'DOE',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: UserRole.INTERN,
    default: UserRole.INTERN,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}

/**
 * DTO pour la mise à jour d'un utilisateur
 * Tous les champs sont optionnels (PATCH partiel)
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email de l\'utilisateur',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email cannot be empty if provided' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille de l\'utilisateur',
    example: 'DOE',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Rôle de l\'utilisateur (admin uniquement)',
    enum: UserRole,
    example: UserRole.INTERN,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  role?: UserRole;
}

/**
 * DTO de réponse pour un utilisateur
 * Représente la structure renvoyée par l'API
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l\'utilisateur',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'DOE',
  })
  lastName: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: UserRole.INTERN,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-01-19T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2026-01-19T15:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
