import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateScrumNoteUseCase } from '@/core/use-cases/scrum-note/create-scrum-note.use-case';
import { DeleteScrumNoteUseCase } from '@/core/use-cases/scrum-note/delete-scrum-note.use-case';
import { GetAllScrumNotesUseCase } from '@/core/use-cases/scrum-note/get-all-scrum-notes.use-case';
import { GetTodayNotesUseCase } from '@/core/use-cases/scrum-note/get-today-notes.use-case';
import { GetUserNotesUseCase } from '@/core/use-cases/scrum-note/get-user-notes.use-case';
import { UpdateScrumNoteUseCase } from '@/core/use-cases/scrum-note/update-scrum-note.use-case';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/infrastructure/auth/guards/roles.guard';
import { Roles } from '@/infrastructure/auth/decorators/roles.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators';
import { User } from '@/core/domain/entities/user.entity';
import {
  CreateScrumNoteDto,
  ScrumNoteResponseDto,
  UpdateScrumNoteDto,
} from './dto';
import { ScrumNotePresentationMapper } from './mappers';
import { KeycloakAuthGuard } from '@/infrastructure/auth/guards';

/**
 * Contrôleur pour la gestion des notes de scrum quotidiennes
 * 
 * Permissions Keycloak (client roles):
 * - scrum_note:view - Voir les notes de scrum
 * - scrum_note:create - Créer des notes
 * - scrum_note:update - Modifier des notes
 * - scrum_note:delete - Supprimer des notes
 * - ADMIN (realm role) - Accès complet
 */
@ApiTags('Scrum Notes')
@Controller('scrum-notes')
@UseGuards(KeycloakAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ScrumNoteController {
  constructor(
    private readonly createScrumNoteUseCase: CreateScrumNoteUseCase,
    private readonly getAllScrumNotesUseCase: GetAllScrumNotesUseCase,
    private readonly getTodayNotesUseCase: GetTodayNotesUseCase,
    private readonly getUserNotesUseCase: GetUserNotesUseCase,
    private readonly updateScrumNoteUseCase: UpdateScrumNoteUseCase,
    private readonly deleteScrumNoteUseCase: DeleteScrumNoteUseCase,
  ) {}

  /**
   * Récupère toutes les notes de scrum
   * @requires scrum_note:view ou ADMIN
   */
  @Get()
  @Roles('scrum_note:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère toutes les notes de scrum',
    description: 'ADMIN voit toutes les notes, INTERN voit uniquement ses propres notes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notes récupérées avec succès',
    type: [ScrumNoteResponseDto],
  })
  async getAllScrumNotes(
    @CurrentUser() user: User,
  ): Promise<ScrumNoteResponseDto[]> {
    const notes = await this.getAllScrumNotesUseCase.execute({
      userId: user.id,
      userRole: user.role,
    });
    return ScrumNotePresentationMapper.toDtoList(notes);
  }

  /**
   * Crée une nouvelle note de scrum
   * @requires scrum_note:create ou ADMIN
   */
  @Post()
  @Roles('scrum_note:create', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Crée une nouvelle note de scrum',
    description: 'Crée une note quotidienne de scrum pour l\'utilisateur authentifié. Une seule note par utilisateur et par jour.',
  })
  @ApiBody({ type: CreateScrumNoteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Note créée avec succès',
    type: ScrumNoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Une note existe déjà pour cet utilisateur à cette date',
  })
  async createScrumNote(
    @Body() dto: CreateScrumNoteDto,
    @CurrentUser() user: User,
  ): Promise<ScrumNoteResponseDto> {
    const note = await this.createScrumNoteUseCase.execute({
      whatIDid: dto.whatIDid,
      nextSteps: dto.nextSteps,
      blockers: dto.blockers,
      userId: user.id,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    return ScrumNotePresentationMapper.toDto(note);
  }

  /**
   * Récupère toutes les notes du jour
   * @requires scrum_note:view ou ADMIN
   */
  @Get('today')
  @Roles('scrum_note:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère les notes du jour',
    description: 'Retourne toutes les notes de scrum créées aujourd\'hui',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notes du jour récupérées avec succès',
    type: [ScrumNoteResponseDto],
  })
  async getTodayNotes(): Promise<ScrumNoteResponseDto[]> {
    const notes = await this.getTodayNotesUseCase.execute();
    return ScrumNotePresentationMapper.toDtoList(notes);
  }

  /**
   * Récupère les notes d'un utilisateur pour une période
   * @requires scrum_note:view ou ADMIN
   */
  @Get('user/:userId')
  @Roles('scrum_note:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère les notes d\'un utilisateur',
    description: 'Retourne les notes de scrum d\'un utilisateur sur une période donnée',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID de l\'utilisateur',
    type: String,
    format: 'uuid',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Date de début (ISO 8601)',
    required: false,
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Date de fin (ISO 8601)',
    required: false,
    type: String,
    example: '2026-01-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notes de l\'utilisateur récupérées avec succès',
    type: [ScrumNoteResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  async getUserNotes(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ScrumNoteResponseDto[]> {
    const notes = await this.getUserNotesUseCase.execute({
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    return ScrumNotePresentationMapper.toDtoList(notes);
  }

  /**
   * Met à jour une note de scrum
   * @requires scrum_note:update ou ADMIN
   */
  @Patch(':id')
  @Roles('scrum_note:update', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Met à jour une note de scrum',
    description: 'Met à jour les champs spécifiés d\'une note (PATCH partiel). Seul le propriétaire ou un admin peut modifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la note',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateScrumNoteDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note mise à jour avec succès',
    type: ScrumNoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Vous n\'avez pas la permission de modifier cette note',
  })
  async updateScrumNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScrumNoteDto,
    @CurrentUser() user: User,
  ): Promise<ScrumNoteResponseDto> {
    const note = await this.updateScrumNoteUseCase.execute({
      noteId: id,
      whatIDid: dto.whatIDid,
      nextSteps: dto.nextSteps,
      blockers: dto.blockers,
      userId: user.id,
      userRole: user.role,
    });
    return ScrumNotePresentationMapper.toDto(note);
  }

  /**
   * Supprime une note de scrum
   * @requires scrum_note:delete ou ADMIN
   */
  @Delete(':id')
  @Roles('scrum_note:delete', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Supprime une note de scrum',
    description: 'Supprime définitivement une note. Seul le propriétaire ou un admin peut supprimer.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la note',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Note supprimée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Vous n\'avez pas la permission de supprimer cette note',
  })
  async deleteScrumNote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.deleteScrumNoteUseCase.execute(id, user.id, user.role);
  }
}
