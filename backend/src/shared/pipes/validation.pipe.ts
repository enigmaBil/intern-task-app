import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Pipe de validation global
 * 
 * Valide automatiquement les DTOs avec class-validator et class-transformer.
 * Retourne une BadRequestException si la validation échoue.
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Si pas de metatype ou type primitif, pas de validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transformer le plain object en instance de classe
    const object = plainToInstance(metatype, value);

    // Valider l'objet
    const errors = await validate(object, {
      whitelist: true, // Retire les propriétés non décorées
      forbidNonWhitelisted: true, // Erreur si propriétés non autorisées
      transform: true, // Active la transformation automatique
    });

    if (errors.length > 0) {
      // Formater les erreurs
      const messages = errors.map(error => {
        const constraints = error.constraints;
        return constraints
          ? Object.values(constraints).join(', ')
          : 'Validation failed';
      });

      throw new BadRequestException({
        message: messages,
        error: 'Validation Error',
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
