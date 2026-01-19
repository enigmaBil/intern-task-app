import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { Prisma, Task as PrismaTask, TaskStatus as PrismaTaskStatus } from "@prisma/client";

/**
 * Mapper pour convertir entre l'entité Task (Domain)
 * et le modèle Prisma Task (Infrastructure)
 * 
 * Ce mapper fait le pont entre notre domaine métier 
 * et la couche de persistance des données.
 */
export class TaskPersistenceMapper {
    /**
   * Convertit un modèle Prisma Task vers une entité Domain Task
   * 
   * @param prismaTask - Modèle Prisma récupéré de la DB
   * @returns Entité Task du domain
   */
  static toDomain(prismaTask: PrismaTask): Task {
    return Task.reconstitute({
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? '',
      status: prismaTask.status as TaskStatus,
      creatorId: prismaTask.createdById,
      assigneeId: prismaTask.assigneeId,
      deadline: prismaTask.deadline,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    });
  }

  /**
   * Convertit une liste de modèles Prisma vers des entités Domain
   * 
   * @param prismaTasks - Liste de modèles Prisma
   * @returns Liste d'entités Task du domain
   */
  static toDomainList(prismaTasks: PrismaTask[]): Task[] {
    return prismaTasks.map((task) => this.toDomain(task));
  }

  /**
   * Convertit une entité Task vers un objet Prisma.TaskCreateInput
   * Utilisé pour les opérations de création
   * 
   * @param task - Entité Task du domain
   * @returns Objet Prisma pour la création
   */
  static toPrismaCreate(task: Task): Prisma.TaskCreateInput {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as PrismaTaskStatus,
      assignee: task.assigneeId
        ? {
            connect: { id: task.assigneeId },
          }
        : undefined,
      createdBy: {
        connect: { id: task.creatorId },
      },
      deadline: task.deadline,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * Convertit une entité Task vers un objet Prisma.TaskUpdateInput
   * Utilisé pour les opérations de mise à jour
   * 
   * @param task - Entité Task du domain
   * @returns Objet Prisma pour la mise à jour
   */
  static toPrismaUpdate(task: Task): Prisma.TaskUpdateInput {
    return {
      title: task.title,
      description: task.description,
      status: task.status as PrismaTaskStatus,
      assignee: task.assigneeId
        ? {
            connect: { id: task.assigneeId },
          }
        : {
            disconnect: true,
          },
      deadline: task.deadline,
      updatedAt: task.updatedAt,
    };
  }
}