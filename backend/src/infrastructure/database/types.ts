/**
 * Prisma Types - Type Safety Exports
 * 
 * This file provides convenient type exports from the generated Prisma Client
 * Use these types throughout the application for type safety
 */

// Re-export all types from Prisma Client
export type {
  // Models
  User,
  Task,
  ScrumNote,
  
  // Prisma utility types
  Prisma,
} from '@/infrastructure/generated/prisma';

// Additional utility types for better DX
import { Prisma } from '@/infrastructure/generated/prisma';

/**
 * User types with relations
 */
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    assignedTasks: true;
    createdTasks: true;
    scrumNotes: true;
  };
}>;

export type UserWithAssignedTasks = Prisma.UserGetPayload<{
  include: { assignedTasks: true };
}>;

export type UserWithCreatedTasks = Prisma.UserGetPayload<{
  include: { createdTasks: true };
}>;

export type UserWithScrumNotes = Prisma.UserGetPayload<{
  include: { scrumNotes: true };
}>;

/**
 * Task types with relations
 */
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    createdBy: true;
    scrumNotes: true;
  };
}>;

export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: { assignee: true };
}>;

export type TaskWithCreator = Prisma.TaskGetPayload<{
  include: { createdBy: true };
}>;

export type TaskWithScrumNotes = Prisma.TaskGetPayload<{
  include: { scrumNotes: true };
}>;

/**
 * ScrumNote types with relations
 */
export type ScrumNoteWithRelations = Prisma.ScrumNoteGetPayload<{
  include: {
    user: true;
    task: true;
  };
}>;

export type ScrumNoteWithUser = Prisma.ScrumNoteGetPayload<{
  include: { user: true };
}>;

export type ScrumNoteWithTask = Prisma.ScrumNoteGetPayload<{
  include: { task: true };
}>;

/**
 * Input types for create/update operations
 */
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
export type UserWhereInput = Prisma.UserWhereInput;

export type TaskCreateInput = Prisma.TaskCreateInput;
export type TaskUpdateInput = Prisma.TaskUpdateInput;
export type TaskWhereUniqueInput = Prisma.TaskWhereUniqueInput;
export type TaskWhereInput = Prisma.TaskWhereInput;

export type ScrumNoteCreateInput = Prisma.ScrumNoteCreateInput;
export type ScrumNoteUpdateInput = Prisma.ScrumNoteUpdateInput;
export type ScrumNoteWhereUniqueInput = Prisma.ScrumNoteWhereUniqueInput;
export type ScrumNoteWhereInput = Prisma.ScrumNoteWhereInput;

/**
 * Pagination types
 */
export type PaginationArgs = {
  skip?: number;
  take?: number;
};

export type UserFindManyArgs = Prisma.UserFindManyArgs;
export type TaskFindManyArgs = Prisma.TaskFindManyArgs;
export type ScrumNoteFindManyArgs = Prisma.ScrumNoteFindManyArgs;

/**
 * Order by types
 */
export type UserOrderByInput = Prisma.UserOrderByWithRelationInput;
export type TaskOrderByInput = Prisma.TaskOrderByWithRelationInput;
export type ScrumNoteOrderByInput = Prisma.ScrumNoteOrderByWithRelationInput;

/**
 * Select types (for partial selection)
 */
export type UserSelect = Prisma.UserSelect;
export type TaskSelect = Prisma.TaskSelect;
export type ScrumNoteSelect = Prisma.ScrumNoteSelect;
