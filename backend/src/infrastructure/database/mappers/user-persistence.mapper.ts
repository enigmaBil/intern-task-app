import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@/infrastructure/generated/prisma';
// import { User as DomainUser } from '@/core/domain/entities/user.entity';

@Injectable()
export class UserPersistenceMapper {
  /**
   * Convert Prisma User model to Domain User entity
   * 
   * @param prismaUser - User model from Prisma
   * @returns Domain User entity
   */
  toDomain(prismaUser: PrismaUser): any {
    if (!prismaUser) {
      return null;
    }

    // TODO: Once User domain entity is implemented, map to it
    // Example:
    // return new DomainUser({
    //   id: new UserId(prismaUser.id),
    //   keycloakId: prismaUser.keycloakId,
    //   email: new Email(prismaUser.email),
    //   firstName: prismaUser.firstName,
    //   lastName: prismaUser.lastName,
    //   role: UserRole[prismaUser.role],
    //   isActive: prismaUser.isActive,
    //   createdAt: prismaUser.createdAt,
    //   updatedAt: prismaUser.updatedAt,
    // });

    // Temporary: Return prisma model as-is
    return prismaUser;
  }

  /**
   * Convert array of Prisma User models to array of Domain User entities
   */
  toDomainArray(prismaUsers: PrismaUser[]): any[] {
    return prismaUsers.map((user) => this.toDomain(user));
  }

  /**
   * Convert Domain User entity to Prisma User creation data
   * 
   * @param domainUser - User entity from domain
   * @returns Data object for Prisma create/update operations
   */
  toPersistence(domainUser: any): Partial<PrismaUser> {
    if (!domainUser) {
      return {};
    }

    // TODO: Once User domain entity is implemented, map from it
    // Example:
    // return {
    //   id: domainUser.id.value,
    //   keycloakId: domainUser.keycloakId,
    //   email: domainUser.email.value,
    //   firstName: domainUser.firstName,
    //   lastName: domainUser.lastName,
    //   role: domainUser.role,
    //   isActive: domainUser.isActive,
    // };

    // Temporary: Return domain object as-is
    return domainUser;
  }

  /**
   * Map partial update data from domain to persistence
   * Used for update operations where only some fields are provided
   */
  toPartialPersistence(
    partialDomainUser: Partial<any>,
  ): Partial<PrismaUser> {
    const persistenceData: Partial<PrismaUser> = {};

    if (partialDomainUser.email !== undefined) {
      persistenceData.email = partialDomainUser.email;
    }
    if (partialDomainUser.firstName !== undefined) {
      persistenceData.firstName = partialDomainUser.firstName;
    }
    if (partialDomainUser.lastName !== undefined) {
      persistenceData.lastName = partialDomainUser.lastName;
    }
    if (partialDomainUser.role !== undefined) {
      persistenceData.role = partialDomainUser.role;
    }
    if (partialDomainUser.isActive !== undefined) {
      persistenceData.isActive = partialDomainUser.isActive;
    }

    return persistenceData;
  }
}
