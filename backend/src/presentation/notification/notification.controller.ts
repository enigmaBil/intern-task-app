import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Sse,
  HttpStatus,
  ParseUUIDPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { User } from '@/core/domain/entities/user.entity';
import { CurrentUser } from '@/infrastructure/auth/decorators';
import { KeycloakAuthGuard, SSEAuthGuard } from '@/infrastructure/auth/guards';
import {
  GetUserNotificationsUseCase,
  GetAllUnreadNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from '@/core/use-cases/notification';
import { NotificationEmitterService } from './notification-emitter.service';
import { NotificationResponseDto, NotificationListResponseDto } from './dto';

/**
 * Contrôleur pour la gestion des notifications
 * 
 * Endpoints:
 * - GET /notifications - Liste des notifications de l'utilisateur
 * - GET /notifications/stream - SSE stream pour les notifications temps réel
 * - GET /notifications/unread - Toutes les notifications non lues
 * - PATCH /notifications/:id/read - Marquer une notification comme lue
 * - PATCH /notifications/read-all - Marquer toutes les notifications comme lues
 */
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly getAllUnreadNotificationsUseCase: GetAllUnreadNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly notificationEmitter: NotificationEmitterService,
  ) {}

  /**
   * Stream SSE pour recevoir les notifications en temps réel
   * Supporte le token via header Authorization OU query param ?token=
   */
  @Get('stream')
  @UseGuards(SSEAuthGuard)
  @Sse()
  @ApiOperation({
    summary: 'Stream de notifications en temps réel',
    description: 'Connexion SSE pour recevoir les notifications en temps réel. Token via header ou query param.',
  })
  @ApiQuery({
    name: 'token',
    required: false,
    type: String,
    description: 'JWT token (alternative au header Authorization)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion SSE établie',
  })
  stream(@CurrentUser() user: User): Observable<{ data: NotificationResponseDto }> {
    return this.notificationEmitter.subscribe(user.id);
  }

  /**
   * Récupère les notifications de l'utilisateur (limité à 10 par défaut)
   */
  @Get()
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liste des notifications',
    description: 'Récupère les dernières notifications de l\'utilisateur',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre maximum de notifications (défaut: 10)',
  })
  @ApiQuery({
    name: 'unreadOnly',
    required: false,
    type: Boolean,
    description: 'Filtrer uniquement les non lues',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des notifications',
    type: NotificationListResponseDto,
  })
  async getNotifications(
    @CurrentUser() user: User,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('unreadOnly', new DefaultValuePipe(false), ParseBoolPipe) unreadOnly: boolean,
  ): Promise<NotificationListResponseDto> {
    const result = await this.getUserNotificationsUseCase.execute({
      userId: user.id,
      limit,
      unreadOnly,
    });

    return {
      notifications: NotificationResponseDto.fromEntityList(result.notifications),
      unreadCount: result.unreadCount,
    };
  }

  /**
   * Récupère toutes les notifications non lues (pour la modale "Voir tout")
   */
  @Get('unread')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toutes les notifications non lues',
    description: 'Récupère toutes les notifications non lues de l\'utilisateur',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des notifications non lues',
    type: [NotificationResponseDto],
  })
  async getAllUnread(@CurrentUser() user: User): Promise<NotificationResponseDto[]> {
    const notifications = await this.getAllUnreadNotificationsUseCase.execute({
      userId: user.id,
    });

    return NotificationResponseDto.fromEntityList(notifications);
  }

  /**
   * Marque une notification comme lue
   */
  @Patch(':id/read')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Marquer comme lue',
    description: 'Marque une notification spécifique comme lue',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notification',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marquée comme lue',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification non trouvée',
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto | null> {
    const notification = await this.markNotificationReadUseCase.execute(id);
    return notification ? NotificationResponseDto.fromEntity(notification) : null;
  }

  /**
   * Marque toutes les notifications de l'utilisateur comme lues
   */
  @Patch('read-all')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Marquer tout comme lu',
    description: 'Marque toutes les notifications de l\'utilisateur comme lues',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nombre de notifications marquées comme lues',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async markAllAsRead(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.markAllNotificationsReadUseCase.execute(user.id);
    return { count };
  }
}
