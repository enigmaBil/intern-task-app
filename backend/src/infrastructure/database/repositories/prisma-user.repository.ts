import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserInteractor } from '@/core/interactors';
import { User } from '@/core/domain/entities/user.entity';
import { UserPersistenceMapper } from '../mappers';
import { UserRole } from '@/core/domain/enums/user-role.enum';


/**
 * Implémentation Prisma du repository User
 */
@Injectable()
export class PrismaUserRepository implements IUserInteractor {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère un utilisateur par son ID
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return UserPersistenceMapper.toDomain(prismaUser);
  }

  /**
   * Récupère un utilisateur par son email
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return null;
    }

    return UserPersistenceMapper.toDomain(prismaUser);
  }

  /**
   * Récupère tous les utilisateurs
   */
  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      orderBy: {
        lastName: 'asc',
      },
    });

    return UserPersistenceMapper.toDomainList(prismaUsers);
  }

  /**
   * Récupère les utilisateurs par rôle
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      where: {
        role: role,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return UserPersistenceMapper.toDomainList(prismaUsers);
  }

  /**
   * Vérifie si un utilisateur existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Vérifie si un email est déjà utilisé
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });

    return count > 0;
  }

  /**
   * Sauvegarde un utilisateur (création ou mise à jour)
   */
  async save(user: User): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const exists = await this.exists(user.id);

    if (exists) {
      // Mise à jour
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          updatedAt: user.updatedAt,
        },
      });

      return UserPersistenceMapper.toDomain(updated);
    } else {
      // Création
      const created = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      return UserPersistenceMapper.toDomain(created);
    }
  }
}