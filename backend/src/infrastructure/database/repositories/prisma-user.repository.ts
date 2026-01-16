import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User as PrismaUser } from '@/infrastructure/generated/prisma';


@Injectable()
export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        assignedTasks: true,
        createdTasks: true,
        scrumNotes: true,
      },
    });
  }

 

  /**
   * Find a user by their email
   */
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users with optional filters
   */
  async findAll(params?: {
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<PrismaUser[]> {
    const { role, isActive, skip, take } = params || {};

    return this.prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(isActive !== undefined && { isActive }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<PrismaUser> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'ADMIN',
      },
    });
  }

  /**
   * Update a user
   */
  async update(
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      isActive?: boolean;
    },
  ): Promise<PrismaUser> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Delete a user (soft delete by setting isActive to false)
   */
  async softDelete(id: string): Promise<PrismaUser> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete a user (permanent deletion)
   */
  async delete(id: string): Promise<PrismaUser> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count users with optional filters
   */
  async count(params?: { role?: string; isActive?: boolean }): Promise<number> {
    const { role, isActive } = params || {};

    return this.prisma.user.count({
      where: {
        ...(role && { role: role as any }),
        ...(isActive !== undefined && { isActive }),
      },
    });
  }

  /**
   * Check if a user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}
