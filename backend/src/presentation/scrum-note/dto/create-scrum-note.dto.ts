import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO pour la création d'une note de scrum quotidien
 */
export class CreateScrumNoteDto {
  @ApiProperty({
    description: 'Ce que j\'ai fait aujourd\'hui',
    example: 'Implémenté le module d\'authentification avec Keycloak',
    maxLength: 2000,
  })
  @IsString({ message: 'WhatIDid must be a string' })
  @IsNotEmpty({ message: 'WhatIDid is required' })
  @MaxLength(2000, { message: 'WhatIDid cannot exceed 2000 characters' })
  whatIDid: string;

  @ApiProperty({
    description: 'Ce que je ferai demain / prochaines étapes',
    example: 'Créer les tests unitaires pour l\'authentification',
    maxLength: 2000,
  })
  @IsString({ message: 'NextSteps must be a string' })
  @IsNotEmpty({ message: 'NextSteps is required' })
  @MaxLength(2000, { message: 'NextSteps cannot exceed 2000 characters' })
  nextSteps: string;

  @ApiPropertyOptional({
    description: 'Blocages rencontrés',
    example: 'Besoin d\'aide pour configurer les rôles Keycloak',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Blockers must be a string' })
  @MaxLength(2000, { message: 'Blockers cannot exceed 2000 characters' })
  blockers?: string;

  @ApiPropertyOptional({
    description: 'Date de la note (par défaut: aujourd\'hui)',
    example: '2026-01-19T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  date?: string;
}
