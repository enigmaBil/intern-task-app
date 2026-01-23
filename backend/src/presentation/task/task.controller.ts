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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TaskStatus } from '@/core/domain/enums/task-status.enum';
import { AssignTaskUseCase } from '@/core/use-cases/task/assign-task.use-case';
import { CreateTaskUseCase } from '@/core/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from '@/core/use-cases/task/delete-task.use-case';
import { GetAllTasksUseCase } from '@/core/use-cases/task/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@/core/use-cases/task/get-task-by-id.use-case';
import { GetTasksByAssigneeUseCase } from '@/core/use-cases/task/get-tasks-by-assignee.use-case';
import { GetTasksByStatusUseCase } from '@/core/use-cases/task/get-tasks-by-status.use-case';
import { UpdateTaskUseCase } from '@/core/use-cases/task/update-task.use-case';
import { RolesGuard } from '@/infrastructure/auth/guards/roles.guard';
import { Roles } from '@/infrastructure/auth/decorators/roles.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators';
import { User } from '@/core/domain/entities/user.entity';
import {
  AssignTaskDto,
  CreateTaskDto,
  TaskResponseDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from './dto';
import { TaskPresentationMapper } from './mappers';
import { ParseTaskStatusPipe } from './pipes';
import { JwtAuthGuard, KeycloakAuthGuard } from '@/infrastructure/auth/guards';

/**
 * Contrôleur pour la gestion des tâches
 * 
 * Permissions Keycloak (client roles):
 * - tasks:view - Voir les tâches
 * - tasks:create - Créer des tâches
 * - tasks:update - Modifier des tâches
 * - tasks:delete - Supprimer des tâches
 * - tasks:assign - Assigner des tâches
 * - tasks:update_status - Changer le statut des tâches
 * - ADMIN (realm role) - Accès complet
 */
@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(KeycloakAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly assignTaskUseCase: AssignTaskUseCase,
    private readonly getTasksByStatusUseCase: GetTasksByStatusUseCase,
    private readonly getTasksByAssigneeUseCase: GetTasksByAssigneeUseCase,
  ) {}

  /**
   * Crée une nouvelle tâche
   * @requires tasks:create ou ADMIN
   */
  @Post()
  @Roles('tasks:create', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Crée une nouvelle tâche',
    description: 'Crée une nouvelle tâche et l\'associe au créateur authentifié',
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tâche créée avec succès',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT manquant ou invalide',
  })
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      creatorId: user.id,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    });
    return TaskPresentationMapper.toDto(task);
  }

  /**
   * Récupère toutes les tâches
   * @requires tasks:view ou ADMIN
   */
  @Get()
  @Roles('tasks:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère toutes les tâches',
    description: 'Retourne la liste des tâches selon le rôle: ADMIN voit tout, INTERN voit uniquement ses tâches assignées',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des tâches récupérée avec succès',
    type: [TaskResponseDto],
  })
  async getAllTasks(@CurrentUser() user: User): Promise<TaskResponseDto[]> {
    const tasks = await this.getAllTasksUseCase.execute({
      userId: user.id,
      userRole: user.role,
    });
    return TaskPresentationMapper.toDtoList(tasks);
  }

  /**
   * Récupère une tâche par ID
   * @requires tasks:view ou ADMIN
   */
  @Get(':id')
  @Roles('tasks:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère une tâche par ID',
    description: 'Retourne les détails d\'une tâche spécifique',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la tâche',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tâche trouvée',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tâche non trouvée',
  })
  async getTaskById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TaskResponseDto> {
    const task = await this.getTaskByIdUseCase.execute(id);
    return TaskPresentationMapper.toDto(task);
  }

  /**
   * Met à jour une tâche
   * @requires tasks:update ou ADMIN
   */
  @Patch(':id')
  @Roles('tasks:update', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Met à jour une tâche',
    description: 'Met à jour les champs spécifiés d\'une tâche (PATCH partiel)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la tâche',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tâche mise à jour avec succès',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tâche non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Vous n\'avez pas la permission de modifier cette tâche',
  })
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskUseCase.execute({
      taskId: id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      userId: user.id,
      userRole: user.role,
    });
    return TaskPresentationMapper.toDto(task);
  }

  /**
   * Supprime une tâche
   * @requires tasks:delete ou ADMIN
   */
  @Delete(':id')
  @Roles('tasks:delete', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Supprime une tâche',
    description: 'Supprime définitivement une tâche (admin uniquement)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la tâche',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tâche supprimée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tâche non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Seuls les admins peuvent supprimer des tâches',
  })
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.deleteTaskUseCase.execute(id, user.id, user.role);
  }

  /**
   * Assigne une tâche à un utilisateur
   * @requires tasks:assign ou ADMIN
   */
  @Patch(':id/assign')
  @Roles('tasks:assign', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Assigne une tâche à un utilisateur',
    description: 'Permet à un admin d\'assigner une tâche à un utilisateur spécifique',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la tâche',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: AssignTaskDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tâche assignée avec succès',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tâche ou utilisateur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Seuls les admins peuvent assigner des tâches',
  })
  async assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: User,
  ): Promise<TaskResponseDto> {
    const task = await this.assignTaskUseCase.execute({
      taskId: id,
      assigneeId: dto.assigneeId,
      creatorId: user.id,
      requesterRole: user.role,
    });
    return TaskPresentationMapper.toDto(task);
  }

  /**
   * Change le statut d'une tâche
   * @requires tasks:update_status ou ADMIN
   */
  @Patch(':id/status')
  @Roles('tasks:update_status', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Change le statut d\'une tâche',
    description: 'Met à jour le statut d\'une tâche (assigné ou admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID unique de la tâche',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour avec succès',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transition de statut invalide',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Vous ne pouvez modifier que vos propres tâches assignées',
  })
  async updateTaskStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskUseCase.execute({
      taskId: id,
      status: dto.status,
      userId: user.id,
      userRole: user.role,
    });
    return TaskPresentationMapper.toDto(task);
  }

  /**
   * Récupère les tâches par statut
   * @requires tasks:view ou ADMIN
   */
  @Get('by-status/:status')
  @Roles('tasks:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère les tâches par statut',
    description: 'Filtre les tâches selon leur statut',
  })
  @ApiParam({
    name: 'status',
    description: 'Statut des tâches à récupérer',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des tâches avec ce statut',
    type: [TaskResponseDto],
  })
  async getTasksByStatus(
    @Param('status', ParseTaskStatusPipe) status: TaskStatus,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.getTasksByStatusUseCase.execute(status);
    return TaskPresentationMapper.toDtoList(tasks);
  }

  /**
   * Récupère les tâches assignées à un utilisateur
   * @requires tasks:view ou ADMIN
   */
  @Get('by-assignee/:assigneeId')
  @Roles('tasks:view', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Récupère les tâches d\'un utilisateur',
    description: 'Filtre les tâches assignées à un utilisateur spécifique',
  })
  @ApiParam({
    name: 'assigneeId',
    description: 'ID de l\'utilisateur assigné',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des tâches assignées à cet utilisateur',
    type: [TaskResponseDto],
  })
  async getTasksByAssignee(
    @Param('assigneeId', ParseUUIDPipe) assigneeId: string,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.getTasksByAssigneeUseCase.execute(assigneeId);
    return TaskPresentationMapper.toDtoList(tasks);
  }
}
