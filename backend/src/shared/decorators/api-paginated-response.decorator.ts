import { Type, applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

/**
 * Classe wrapper pour les réponses paginées
 */
export class PaginatedDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 100, description: 'Nombre total d\'éléments' })
  total: number;

  @ApiProperty({ example: 1, description: 'Page actuelle' })
  page: number;

  @ApiProperty({ example: 10, description: 'Nombre d\'éléments par page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Nombre total de pages' })
  totalPages: number;
}

/**
 * Décorateur pour documenter les réponses paginées dans Swagger
 * 
 * Génère automatiquement la documentation OpenAPI pour les endpoints
 * qui retournent des résultats paginés.
 * 
 * @param dataDto - Le type de DTO contenu dans le tableau data
 * 
 * @example
 * ```typescript
 * @Get()
 * @ApiPaginatedResponse(TaskResponseDto)
 * async getTasks(@Query() query: PaginationDto) {
 *   return this.taskService.findAll(query);
 * }
 * ```
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Réponse paginée',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: 'number',
                example: 100,
                description: 'Nombre total d\'éléments',
              },
              page: {
                type: 'number',
                example: 1,
                description: 'Page actuelle',
              },
              limit: {
                type: 'number',
                example: 10,
                description: 'Nombre d\'éléments par page',
              },
              totalPages: {
                type: 'number',
                example: 10,
                description: 'Nombre total de pages',
              },
            },
          },
        ],
      },
    }),
  );
};
