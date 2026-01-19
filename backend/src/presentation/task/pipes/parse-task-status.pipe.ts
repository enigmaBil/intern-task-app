import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '@/core/domain/enums/task-status.enum';

/**
 * Pipe personnalisé pour valider et parser les statuts de tâches
 * 
 * Vérifie que le statut fourni est valide selon l'enum TaskStatus
 */
@Injectable()
export class ParseTaskStatusPipe implements PipeTransform<string, TaskStatus> {
  /**
   * Transforme et valide le statut de tâche
   * 
   * @param value - Valeur du statut en string
   * @returns TaskStatus validé
   * @throws BadRequestException si le statut est invalide
   */
  transform(value: string): TaskStatus {
    const upperValue = value.toUpperCase();

    // Vérifie si la valeur est un statut valide
    if (!Object.values(TaskStatus).includes(upperValue as TaskStatus)) {
      throw new BadRequestException(
        `Invalid task status: ${value}. Allowed values are: ${Object.values(TaskStatus).join(', ')}`,
      );
    }

    return upperValue as TaskStatus;
  }
}
