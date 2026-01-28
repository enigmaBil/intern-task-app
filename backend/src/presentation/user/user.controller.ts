import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@/core/domain/enums/user-role.enum';
import { GetAllUsersUseCase } from '@/core/use-cases/user/get-all-users.use-case';
import { GetUserByIdUseCase } from '@/core/use-cases/user/get-user-by-id.use-case';
import { GetUsersByRoleUseCase } from '@/core/use-cases/user/get-users-by-role.use-case';
import { DeactivateUserUseCase } from '@/core/use-cases/user/deactivate-user.use-case';
import { ActivateUserUseCase } from '@/core/use-cases/user/activate-user.use-case';
import { SyncUsersWithKeycloakUseCase } from '@/core/use-cases/user/sync-users-with-keycloak.use-case';
import { SyncUserFromAuthUseCase } from '@/core/use-cases/user/sync-user-from-auth.use-case';
import { RolesGuard } from '@/infrastructure/auth/guards/roles.guard';
import { Roles } from '@/infrastructure/auth/decorators/roles.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { UserResponseDto, SyncUserDto } from './dto';
import { UserPresentationMapper } from './mappers';
import { JwtAuthGuard, KeycloakAuthGuard } from '@/infrastructure/auth/guards';

/**
 * Contrôleur pour la gestion des utilisateurs
 * 
 * Permissions Keycloak:
 * - ADMIN (realm role) - Accès complet aux informations utilisateurs
 * - INTERN (realm role) - Accès limité à ses propres informations
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(KeycloakAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersByRoleUseCase: GetUsersByRoleUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly syncUsersWithKeycloakUseCase: SyncUsersWithKeycloakUseCase,
    private readonly syncUserFromAuthUseCase: SyncUserFromAuthUseCase,
  ) {}

  /**
   * Récupère tous les utilisateurs
   * Accessible à tous les utilisateurs authentifiés pour faciliter l'assignation des tâches
   * 
   * @returns Liste de tous les utilisateurs
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère tous les utilisateurs',
    description: 'Retourne la liste complète des utilisateurs enregistrés dans le système. Accessible à tous les utilisateurs authentifiés.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs récupérée avec succès',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT manquant ou invalide',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsersUseCase.execute();
    return UserPresentationMapper.toDtoList(users);
  }

  /**
   * Récupère un utilisateur par son ID
   * 
   * @param id - ID de l'utilisateur
   * @returns Utilisateur trouvé
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère un utilisateur par ID',
    description: 'Retourne les détails d\'un utilisateur spécifique',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de l\'utilisateur',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur trouvé',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID invalide (doit être un UUID)',
  })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.getUserByIdUseCase.execute(id);
    return UserPresentationMapper.toDto(user);
  }

  /**
   * Récupère les utilisateurs par rôle
   * @requires ADMIN
   * 
   * @param role - Rôle à filtrer (ADMIN, PRODUCT_OWNER, SCRUM_MASTER, DEVELOPER, INTERN)
   * @returns Liste des utilisateurs ayant ce rôle
   */
  @Get('by-role/:role')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère les utilisateurs par rôle',
    description: 'Filtre et retourne les utilisateurs ayant un rôle spécifique',
  })
  @ApiParam({
    name: 'role',
    description: 'Rôle des utilisateurs à récupérer',
    enum: UserRole,
    example: UserRole.INTERN,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des utilisateurs avec ce rôle',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Rôle invalide',
  })
  async getUsersByRole(
    @Param('role') role: UserRole,
  ): Promise<UserResponseDto[]> {
    const users = await this.getUsersByRoleUseCase.execute(role);
    return UserPresentationMapper.toDtoList(users);
  }

  /**
   * Désactive un utilisateur
   * @requires ADMIN
   */
  @Post(':id/deactivate')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Désactive un utilisateur',
    description: 'Désactive un utilisateur en passant isActive à false',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'utilisateur',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Utilisateur désactivé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deactivateUserUseCase.execute(id);
  }

  /**
   * Active un utilisateur
   * @requires ADMIN
   */
  @Post(':id/activate')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Active un utilisateur',
    description: 'Active un utilisateur en passant isActive à true',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de l\'utilisateur',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Utilisateur activé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.activateUserUseCase.execute(id);
  }

  /**
   * Synchronise les utilisateurs avec Keycloak
   * @requires ADMIN
   */
  @Post('sync')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Synchronise les utilisateurs avec Keycloak',
    description: 'Retourne les statistiques des utilisateurs',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Synchronisation effectuée',
  })
  async syncUsers(): Promise<{ total: number; active: number; deactivated: number }> {
    return await this.syncUsersWithKeycloakUseCase.execute();
  }

  /**
   * Synchronise un utilisateur individuel après authentification OAuth
   * Cet endpoint est appelé par le frontend après chaque connexion Google OAuth
   * pour créer ou mettre à jour l'utilisateur dans la base de données
   * Endpoint public car l'utilisateur n'est pas encore synchronisé au moment de l'appel
   */
  @Post('sync-me')
  @Public() // Endpoint public pour permettre la synchronisation initiale
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Synchronise l\'utilisateur courant',
    description: 'Crée ou met à jour l\'utilisateur dans la base de données après authentification OAuth',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur synchronisé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  async syncCurrentUser(
    @Body() syncUserDto: SyncUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.syncUserFromAuthUseCase.execute(syncUserDto);
    return UserPresentationMapper.toDto(user);
  }
}
