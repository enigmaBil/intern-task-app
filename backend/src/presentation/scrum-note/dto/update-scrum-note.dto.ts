import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


/**
 * DTO pour la mise à jour d'une note de scrum
 * Tous les champs sont optionnels (PATCH partiel)
 */
export class UpdateScrumNoteDto {
  @ApiPropertyOptional({
    description: 'Ce que j\'ai fait aujourd\'hui',
    example: 'Implémenté le module d\'authentification avec Keycloak',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'WhatIDid must be a string' })
  @MaxLength(2000, { message: 'WhatIDid cannot exceed 2000 characters' })
  whatIDid?: string;

  @ApiPropertyOptional({
    description: 'Ce que je ferai demain / prochaines étapes',
    example: 'Créer les tests unitaires pour l\'authentification',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'NextSteps must be a string' })
  @MaxLength(2000, { message: 'NextSteps cannot exceed 2000 characters' })
  nextSteps?: string;

  @ApiPropertyOptional({
    description: 'Blocages rencontrés',
    example: 'Besoin d\'aide pour configurer les rôles Keycloak',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Blockers must be a string' })
  @MaxLength(2000, { message: 'Blockers cannot exceed 2000 characters' })
  blockers?: string;
}