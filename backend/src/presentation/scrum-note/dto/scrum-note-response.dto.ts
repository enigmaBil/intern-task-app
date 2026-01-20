import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


/**
 * DTO de réponse pour une note de scrum
 * Représente la structure renvoyée par l'API
 */
export class ScrumNoteResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la note',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Date de la note (normalisée à 00:00:00)',
    example: '2026-01-19T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  date: Date;

  @ApiProperty({
    description: 'Ce que j\'ai fait',
    example: 'Implémenté le module d\'authentification',
  })
  whatIDid: string;

  @ApiProperty({
    description: 'Prochaines étapes',
    example: 'Créer les tests unitaires',
  })
  nextSteps: string;

  @ApiProperty({
    description: 'Blocages rencontrés',
    example: 'Besoin d\'aide pour la configuration',
  })
  blockers: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur propriétaire',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  userId: string;

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
