import { ITaskInteractor } from "@/core/interactors";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { Task } from "@/core/domain/entities/task.entity";
import { TaskPersistenceMapper } from "../mappers";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";

/**
 * Implémentation Prisma du repository Task
 * 
 * Cette classe implémente l'interface ITaskRepository définie dans le Core
 * et utilise Prisma pour la persistance des données
 */
@Injectable()
export class PrismaTaskRepository implements ITaskInteractor {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère une tâche par son ID
   */
  async findById(id: string): Promise<Task | null> {
    const prismaTask = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!prismaTask) {
      return null;
    }

    return TaskPersistenceMapper.toDomain(prismaTask);
  }

  /**
   * Récupère toutes les tâches
   */
  async findAll(): Promise<Task[]> {
    const prismaTasks = await this.prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return TaskPersistenceMapper.toDomainList(prismaTasks);
  }

  /**
   * Récupère les tâches par statut
   */
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const prismaTasks = await this.prisma.task.findMany({
      where: {
        status: status,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return TaskPersistenceMapper.toDomainList(prismaTasks);
  }

  /**
   * Récupère les tâches assignées à un utilisateur
   */
  async findByAssignee(assigneeId: string): Promise<Task[]> {
    const prismaTasks = await this.prisma.task.findMany({
      where: {
        assigneeId: assigneeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return TaskPersistenceMapper.toDomainList(prismaTasks);
  }

  /**
   * Récupère les tâches en retard (deadline passée et status != DONE)
   */
  async findOverdue(): Promise<Task[]> {
    const now = new Date();

    const prismaTasks = await this.prisma.task.findMany({
      where: {
        deadline: {
          lt: now,
        },
        status: {
          not: 'DONE',
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return TaskPersistenceMapper.toDomainList(prismaTasks);
  }

  /**
   * Sauvegarde une tâche (création ou mise à jour)
   */
  async save(task: Task): Promise<Task> {
    // Vérifier si la tâche existe déjà
    const exists = await this.exists(task.id);

    if (exists) {
      // Mise à jour
      const updated = await this.prisma.task.update({
        where: { id: task.id },
        data: TaskPersistenceMapper.toPrismaUpdate(task),
      });

      return TaskPersistenceMapper.toDomain(updated);
    } else {
      // Création
      const created = await this.prisma.task.create({
        data: TaskPersistenceMapper.toPrismaCreate(task),
      });

      return TaskPersistenceMapper.toDomain(created);
    }
  }

  /**
   * Supprime une tâche
   */
  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Vérifie si une tâche existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: { id },
    });

    return count > 0;
  }
}