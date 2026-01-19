import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { InvalidTaskTransitionException } from "@/core/domain/exceptions/invalid-task-transition.exception";
import { TaskNotAssignableException } from "@/core/domain/exceptions/task-not-assignable.exception";

/**
 * Tests unitaires pour l'entité Task
 * 
 * Cess tests sont purs et ne dépendent d'aucun framework externe
 * on teste uniquement la logique métier encapsulée dans l'entité.
 */
describe('Task Entity',() => {
    describe('create', () => {
        it('should create a new Task with valid data', () => {
            // Arrange
            const data = {
                title: 'Implement authentication',
                description: 'Implement user authentication using JWT',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                creatorId: 'test-creator-id',
            };

            // Act
            const task = Task.create(data);

            // Assert
            expect(task.id).toBeDefined();
            expect(task.title).toBe(data.title);
            expect(task.description).toBe(data.description);
            expect(task.status).toBe('TODO');
            expect(task.assigneeId).toBeNull();
            expect(task.deadline).toEqual(data.deadline);
            expect(task.createdAt).toBeInstanceOf(Date);
            expect(task.updatedAt).toBeInstanceOf(Date);
        });

        it('should create a new Task without a deadline', () => {
            // Arrange
            const data = {
                title: 'Set up project',
                description: 'Initialize the project repository and structure',
                creatorId: 'test-creator-id',
            };

            // Act
            const task = Task.create(data);

            // Assert
            expect(task.deadline).toBeNull();
        });

        it('should trim whitespace from title and description', () => {
            // Arrange
            const data = {
                title: '   Write unit tests   ',
                description: '   Ensure all core entities are tested   ',
                creatorId: 'test-creator-id',
            };

            // Act
            const task = Task.create(data);

            // Assert
            expect(task.title).toBe('Write unit tests');
            expect(task.description).toBe('Ensure all core entities are tested');
        });

        it('should throw an error if title is empty', () => {
            // Arrange
            const data = {
                title: '',
                description: 'Valid description',
                creatorId: 'test-creator-id',
            };
            // Act & Assert
            expect(() => Task.create(data)).toThrow('Task title cannot be empty');
        });

        it('should throw an error if title is only whitespace', () => {
            // Arrange
            const data = {
                title: '   ',
                description: 'Valid description',
                creatorId: 'test-creator-id',
            };
            // Act & Assert
            expect(() => Task.create(data)).toThrow('Task title cannot be empty');
        });

        it('should throw an error if title exceeds 255 characters', () => {
            // Arrange
            const data = {
                title: 'a'.repeat(256),
                description: 'Valid description',
                creatorId: 'test-creator-id',
            };
            // Act & Assert
            expect(() => Task.create(data)).toThrow('Task title cannot exceed 255 characters');
        });

        it('should throw an error if description is empty', () => {
            // Arrange
            const data = {
                title: 'Valid Title',
                description: '',
                creatorId: 'test-creator-id',
            };
            // Act & Assert
            expect(() => Task.create(data)).toThrow('Task description cannot be empty');
        });

        it('should throw an error if deadline is in the past', () => {
            // Arrange
            const data = {
                title: 'Valid Title',
                description: 'Valid description',
                deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                creatorId: 'test-creator-id',
            };
            // Act & Assert
            expect(() => Task.create(data)).toThrow('Task deadline cannot be in the past');
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute a Task from database data', () => {
            // Arrange
            const data = {
                id: 'task-123',
                title: 'Fix bugs',
                description: 'Fix all critical bugs reported',
                status: TaskStatus.IN_PROGRESS,
                assigneeId: 'user-456',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                creatorId: 'test-creator-id',
            };

            // Act
            const task = Task.reconstitute(data);

            // Assert
            expect(task.id).toBe(data.id);
            expect(task.title).toBe(data.title);
            expect(task.description).toBe(data.description);
            expect(task.status).toBe(data.status);
            expect(task.assigneeId).toBe(data.assigneeId);
            expect(task.deadline).toEqual(data.deadline);
            expect(task.createdAt).toEqual(data.createdAt);
            expect(task.updatedAt).toEqual(data.updatedAt);
        });
    });

    describe('assign', () => {
        it('should assign the task to a user if requester is admin', () => {
            // Arrange
            const task = Task.create({
                title: 'Code Review',
                description: 'Review code for the new feature',
                creatorId: 'test-creator-id',
            });
            const userId = 'user-123';
            const originalUpdatedAt = task.updatedAt;
            //attendre 1 seconde pour s'assurer que updatedAt change
            jest.useFakeTimers();
            jest.advanceTimersByTime(1000);

            // Act
            task.assign(userId, UserRole.ADMIN);

            // Assert
            expect(task.assigneeId).toBe(userId);
            expect(task.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

            jest.useRealTimers();
        });

        it('should throw error when requester is not admin', () => {
            // Arrange
            const task = Task.create({
                title: 'Design Database Schema',
                description: 'Create ER diagrams and define relationships',
                creatorId: 'test-creator-id',
            });
            const userId = 'user-456';

            // Act & Assert
            expect(() => {
                task.assign(userId, UserRole.INTERN);
            }).toThrow(TaskNotAssignableException);
            expect(() => task.assign(userId, UserRole.INTERN)).toThrow(
                'Only admins can assign tasks',
            );
        });

        it('should throw error when trying to assign a completed task', () => {
            // Arrange
            const task = Task.reconstitute({
                id: 'task-789',
                title: 'Deploy to Production',
                description: 'Deploy the latest version to the production environment',
                status: TaskStatus.DONE,
                assigneeId: null,
                deadline: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                creatorId: 'test-creator-id',
            });
            const userId = 'user-999';

            // Act & Assert
            expect(() => task.assign(userId, UserRole.ADMIN)).toThrow(
                TaskNotAssignableException,
            );
            expect(() => task.assign(userId, UserRole.ADMIN)).toThrow(
                'Cannot assign a completed task',
            );
        });

    });

    describe('updateStatus', () => {
    it('should update status when transition is valid (TODO -> IN_PROGRESS)', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });
      task.assign('user-123', UserRole.ADMIN);

      // Act
      task.updateStatus(TaskStatus.IN_PROGRESS, 'user-123', UserRole.INTERN);

      // Assert
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update status when transition is valid (IN_PROGRESS -> DONE)', () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'test-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        assigneeId: 'user-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'test-creator-id',
      });

      // Act
      task.updateStatus(TaskStatus.DONE, 'user-123', UserRole.INTERN);

      // Assert
      expect(task.status).toBe(TaskStatus.DONE);
    });

    it('should throw error when trying to move DONE task to TODO', () => {
      // Arrange
      const task = Task.reconstitute({
        id: 'test-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.DONE,
        assigneeId: 'user-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: 'test-creator-id',
      });

      // Act & Assert
      expect(() =>
        task.updateStatus(TaskStatus.TODO, 'user-123', UserRole.ADMIN),
      ).toThrow(InvalidTaskTransitionException);
    });

    it('should throw error when intern tries to update non-assigned task', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });
      task.assign('user-123', UserRole.ADMIN);

      // Act & Assert
      expect(() =>
        task.updateStatus(TaskStatus.IN_PROGRESS, 'user-456', UserRole.INTERN),
      ).toThrow(TaskNotAssignableException);
      expect(() =>
        task.updateStatus(TaskStatus.IN_PROGRESS, 'user-456', UserRole.INTERN),
      ).toThrow('Interns can only update their own assigned tasks');
    });

    it('should allow admin to update any task', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });
      task.assign('user-123', UserRole.ADMIN);

      // Act
      task.updateStatus(TaskStatus.IN_PROGRESS, 'admin-456', UserRole.ADMIN);

      // Assert
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });
    });

    describe('update', () => {
    it('should update task details when requester is admin', () => {
      // Arrange
      const task = Task.create({
        title: 'Old Title',
        description: 'Old Description',
        creatorId: 'test-creator-id',
      });

      // Act
      task.update(
        {
          title: 'New Title',
          description: 'New Description',
          deadline: new Date('2026-12-31'),
        },
        UserRole.ADMIN,
      );

      // Assert
      expect(task.title).toBe('New Title');
      expect(task.description).toBe('New Description');
      expect(task.deadline).toEqual(new Date('2026-12-31'));
    });

    it('should throw error when requester is not admin', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });

      // Act & Assert
      expect(() =>
        task.update({ title: 'New Title' }, UserRole.INTERN),
      ).toThrow(TaskNotAssignableException);
    });

    it('should throw error when updating with empty title', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });

      // Act & Assert
      expect(() => task.update({ title: '' }, UserRole.ADMIN)).toThrow(
        'Task title cannot be empty',
      );
    });

    it('should throw error when updating with past deadline', () => {
      // Arrange
      const task = Task.create({
        title: 'Test Task',
        description: 'Test Description',
        creatorId: 'test-creator-id',
      });

      // Act & Assert
      expect(() =>
        task.update({ deadline: new Date('2020-01-01') }, UserRole.ADMIN),
      ).toThrow('Task deadline cannot be in the past');
    });
    });

    describe('isOverdue', () => {
        it('should return true when deadline is in the past and status is not DONE', () => {
        // Arrange
        const task = Task.reconstitute({
            id: 'test-id',
            title: 'Test Task',
            description: 'Test Description',
            status: TaskStatus.IN_PROGRESS,
            assigneeId: null,
            deadline: new Date('2020-01-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: 'test-creator-id',
        });

        // Act
        const result = task.isOverdue();

        // Assert
        expect(result).toBe(true);
        });

        it('should return false when deadline is in the future', () => {
        // Arrange
        const task = Task.reconstitute({
            id: 'test-id',
            title: 'Test Task',
            description: 'Test Description',
            status: TaskStatus.TODO,
            assigneeId: null,
            deadline: new Date('2030-01-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: 'test-creator-id',
        });

        // Act
        const result = task.isOverdue();

        // Assert
        expect(result).toBe(false);
        });

        it('should return false when task is DONE even with past deadline', () => {
        // Arrange
        const task = Task.reconstitute({
            id: 'test-id',
            title: 'Test Task',
            description: 'Test Description',
            status: TaskStatus.DONE,
            assigneeId: null,
            deadline: new Date('2020-01-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorId: 'test-creator-id',
        });

        // Act
        const result = task.isOverdue();

        // Assert
        expect(result).toBe(false);
        });

        it('should return false when there is no deadline', () => {
        // Arrange
        const task = Task.create({
            title: 'Test Task',
            description: 'Test Description',
            creatorId: 'test-creator-id',
        });

        // Act
        const result = task.isOverdue();

        // Assert
        expect(result).toBe(false);
        });
    });

    describe('isAssignedTo', () => {
        it('should return true when task is assigned to given user', () => {
        // Arrange
        const task = Task.create({
            title: 'Test Task',
            description: 'Test Description',
            creatorId: 'test-creator-id',
        });
        task.assign('user-123', UserRole.ADMIN);

        // Act
        const result = task.isAssignedTo('user-123');

        // Assert
        expect(result).toBe(true);
        });

        it('should return false when task is assigned to different user', () => {
        // Arrange
        const task = Task.create({
            title: 'Test Task',
            description: 'Test Description',
            creatorId: 'test-creator-id',
        });
        task.assign('user-123', UserRole.ADMIN);

        // Act
        const result = task.isAssignedTo('user-456');

        // Assert
        expect(result).toBe(false);
        });

        it('should return false when task is not assigned', () => {
        // Arrange
        const task = Task.create({
            title: 'Test Task',
            description: 'Test Description',
            creatorId: 'test-creator-id',
        });

        // Act
        const result = task.isAssignedTo('user-123');

        // Assert
        expect(result).toBe(false);
        });
    });

    describe('canBeDeleted', () => {
        it('should return true when requester is admin', () => {
            // Arrange
            const task = Task.create({
                title: 'Test Task',
                description: 'Test Description',
                creatorId: 'test-creator-id',
            });

            // Act
            const result = task.canBeDeleted(UserRole.ADMIN);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when requester is intern', () => {
            // Arrange
            const task = Task.create({
                title: 'Test Task',
                description: 'Test Description',
                creatorId: 'test-creator-id',
            });

            // Act
            const result = task.canBeDeleted(UserRole.INTERN);

            // Assert
            expect(result).toBe(false);
        });
    });
});