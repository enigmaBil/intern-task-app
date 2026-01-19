import { Task } from "@/core/domain/entities/task.entity";
import { User } from "@/core/domain/entities/user.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";


/**
 * Tests unitaires pour l'entité User
 * Tests PURS sans dépendances framework
 */
describe('User Entity', () => {
  describe('reconstitute', () => {
    it('should reconstitute a user from database data', () => {
      // Arrange
      const data = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-10'),
      };

      // Act
      const user = User.reconstitute(data);

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.createdAt).toEqual(new Date('2026-01-01'));
      expect(user.updatedAt).toEqual(new Date('2026-01-10'));
    });
  });

  describe('isAdmin', () => {
    it('should return true when user role is ADMIN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.isAdmin();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user role is INTERN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'intern@example.com',
        name: 'Intern User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.isAdmin();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isIntern', () => {
    it('should return true when user role is INTERN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'intern@example.com',
        name: 'Intern User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.isIntern();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user role is ADMIN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.isIntern();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canAssignTasks', () => {
    it('should return true when user is ADMIN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.canAssignTasks();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user is INTERN', () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'intern@example.com',
        name: 'Intern User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = user.canAssignTasks();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canModifyTask', () => {
    it('should return true when user is ADMIN regardless of task assignment', () => {
      // Arrange
      const admin = User.reconstitute({
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        assigneeId: 'other-user-456',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = admin.canModifyTask(task);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when INTERN is assigned to the task', () => {
      // Arrange
      const intern = User.reconstitute({
        id: 'intern-123',
        email: 'intern@example.com',
        name: 'Intern User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        assigneeId: 'intern-123',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = intern.canModifyTask(task);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when INTERN is not assigned to the task', () => {
      // Arrange
      const intern = User.reconstitute({
        id: 'intern-123',
        email: 'intern@example.com',
        name: 'Intern User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const task = Task.reconstitute({
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        assigneeId: 'other-intern-456',
        deadline: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = intern.canModifyTask(task);

      // Assert
      expect(result).toBe(false);
    });
  });
});