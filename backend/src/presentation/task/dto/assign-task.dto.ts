import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '@/core/domain/enums/task-status.enum';


/**
 * DTO pour assigner une tâche à un utilisateur
 */
export class AssignTaskDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur à assigner à la tâche',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Assignee ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Assignee ID is required' })
  assigneeId: string;
}