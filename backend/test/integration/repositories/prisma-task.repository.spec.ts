import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { PrismaService } from "@/infrastructure/database";
import { PrismaTaskRepository } from "@/infrastructure/database/repositories";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

/**
 * Tests d'intégration pour PrismaTaskRepository
 * 
 * Ces tests utilisent une VRAIE base de données (ou une DB de test)
 * Ils testent l'intégration entre notre code et Prisma
 * 
 * IMPORTANT: Ces tests nécessitent une base de données de test configurée
 */
describe('PrismaTaskRepository (Integration)', () => {
  let repository: PrismaTaskRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  // ID de test pour cleanup
  let testTaskIds: string[] = [];
  let testUserId: string;

  beforeAll(async () => {
    // Créer le module de test avec les vrais services
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [PrismaService, PrismaTaskRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<PrismaTaskRepository>(PrismaTaskRepository);

    // Créer un utilisateur de test
    const testUser = await prisma.client.user.create({
      data: {
        id: 'test-user-integration',
        email: 'integration-test@test.com',
        firstName: 'Integration Test User',
        lastName: 'Userton',
        role: 'ADMIN',
      },
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Nettoyer les tâches créées pendant les tests
    if (testTaskIds.length > 0) {
      await prisma.client.task.deleteMany({
        where: {
          id: {
            in: testTaskIds,
          },
        },
      });
      testTaskIds = [];
    }
  });

  afterAll(async () => {
    // Nettoyer l'utilisateur de test
    if (testUserId) {
      await prisma.client.user.delete({
        where: { id: testUserId },
      });
    }

    await prisma.client.$disconnect();
    await module.close();
  });

  describe('save and findById', () => {
    it('should save a new task and retrieve it by id', async () => {
      // Arrange
      const task = Task.create({
        title: 'Integration Test Task',
        description: 'This is a test task for integration testing',
        deadline: new Date('2026-12-31'),
        creatorId: testUserId,
      });
      testTaskIds.push(task.id);

      // Act
      const savedTask = await repository.save(task);
      const foundTask = await repository.findById(task.id);

      // Assert
      expect(savedTask).toBeDefined();
      expect(savedTask.id).toBe(task.id);
      expect(savedTask.title).toBe('Integration Test Task');
      
      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(task.id);
      expect(foundTask?.title).toBe('Integration Test Task');
    });

    it('should update an existing task', async () => {
      // Arrange
      const task = Task.create({
        title: 'Original Title',
        description: 'Original Description',
        creatorId: testUserId,
      });
      testTaskIds.push(task.id);

      await repository.save(task);

      // Modifier la tâche
      task.update(
        {
          title: 'Updated Title',
          description: 'Updated Description',
        },
        UserRole.ADMIN,
      );

      // Act
      const updatedTask = await repository.save(task);
      const foundTask = await repository.findById(task.id);

      // Assert
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.description).toBe('Updated Description');
      expect(foundTask?.title).toBe('Updated Title');
    });

    it('should return null when task does not exist', async () => {
      // Act
      const foundTask = await repository.findById('non-existent-id');

      // Assert
      expect(foundTask).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return tasks filtered by status', async () => {
      // Arrange
      const task1 = Task.create({
        title: 'Task TODO',
        description: 'Description',
        creatorId: testUserId,
      });
      testTaskIds.push(task1.id);

      const task2 = Task.create({
        title: 'Task IN_PROGRESS',
        description: 'Description',
        creatorId: testUserId,
      });
      task2.updateStatus(TaskStatus.IN_PROGRESS, testUserId, UserRole.ADMIN);
      testTaskIds.push(task2.id);

      await repository.save(task1);
      await repository.save(task2);

      // Act
      const todoTasks = await repository.findByStatus(TaskStatus.TODO);
      const inProgressTasks = await repository.findByStatus(
        TaskStatus.IN_PROGRESS,
      );

      // Assert
      expect(todoTasks.some((t) => t.id === task1.id)).toBe(true);
      expect(inProgressTasks.some((t) => t.id === task2.id)).toBe(true);
    });
  });

  describe('findByAssignee', () => {
    it('should return tasks assigned to a specific user', async () => {
      // Arrange
      const task1 = Task.create({
        title: 'Assigned Task',
        description: 'Description',
        creatorId: testUserId,
      });
      task1.assign(testUserId, UserRole.ADMIN);
      testTaskIds.push(task1.id);

      const task2 = Task.create({
        title: 'Unassigned Task',
        description: 'Description',
        creatorId: testUserId,
      });
      testTaskIds.push(task2.id);

      await repository.save(task1);
      await repository.save(task2);

      // Act
      const assignedTasks = await repository.findByAssignee(testUserId);

      // Assert
      expect(assignedTasks.some((t) => t.id === task1.id)).toBe(true);
      expect(assignedTasks.some((t) => t.id === task2.id)).toBe(false);
    });
  });

  describe('findOverdue', () => {
    it('should return tasks that are overdue', async () => {
      // Arrange
      // Bypass validation by using reconstitute directly with past date
      const overdueTask = Task.reconstitute({
        id: 'overdue-task-id',
        title: 'Overdue Task',
        description: 'Description',
        status: TaskStatus.IN_PROGRESS,
        assigneeId: null,
        deadline: new Date('2020-01-01'), // Past date
        creatorId: testUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      testTaskIds.push(overdueTask.id);

      const futureTask = Task.create({
        title: 'Future Task',
        description: 'Description',
        deadline: new Date('2030-01-01'),
        creatorId: testUserId,
      });
      testTaskIds.push(futureTask.id);

      await repository.save(overdueTask);
      await repository.save(futureTask);

      // Act
      const overdueTasks = await repository.findOverdue();

      // Assert
      expect(overdueTasks.some((t) => t.id === overdueTask.id)).toBe(true);
      expect(overdueTasks.some((t) => t.id === futureTask.id)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      // Arrange
      const task = Task.create({
        title: 'Task to Delete',
        description: 'Description',
        creatorId: testUserId,
      });
      await repository.save(task);

      // Act
      await repository.delete(task.id);
      const foundTask = await repository.findById(task.id);

      // Assert
      expect(foundTask).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true when task exists', async () => {
      // Arrange
      const task = Task.create({
        title: 'Existing Task',
        description: 'Description',
        creatorId: testUserId,
      });
      testTaskIds.push(task.id);
      await repository.save(task);

      // Act
      const result = await repository.exists(task.id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when task does not exist', async () => {
      // Act
      const result = await repository.exists('non-existent-id');

      // Assert
      expect(result).toBe(false);
    });
  });
});