import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import {User as PrismaUser, UserRole as PrismaUserRole} from "@prisma/client";

/**
 * Mapper pour convertir entre l'entité User (Domain)
 * et le modèle Prisma User (Infrastructure)
 */
export class UserPersistenceMapper {
  /**
   * Convertit un modèle Prisma User vers une entité Domain User
   * 
   * @param prismaUser - Modèle Prisma récupéré de la DB
   * @returns Entité User du domain
   */
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  /**
   * Convertit une liste de modèles Prisma vers des entités Domain
   * 
   * @param prismaUsers - Liste de modèles Prisma
   * @returns Liste d'entités User du domain
   */
  static toDomainList(prismaUsers: PrismaUser[]): User[] {
    return prismaUsers.map((user) => this.toDomain(user));
  }
}