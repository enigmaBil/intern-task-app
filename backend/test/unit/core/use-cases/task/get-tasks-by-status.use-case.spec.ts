import { Task } from "@/core/domain/entities/task.entity";
import { TaskStatus } from "@/core/domain/enums/task-status.enum";
import { ITaskInteractor } from "@/core/interactors";
import { GetTasksByStatusUseCase } from "@/core/use-cases/task";

describe('GetTasksByStatusUseCase', () => {
  let useCase: GetTasksByStatusUseCase;
  let mockTaskInteractor: jest.Mocked<ITaskInteractor>;

  beforeEach(() => {
    mockTaskInteractor = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByAssignee: jest.fn(),
      findOverdue: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    useCase = new GetTasksByStatusUseCase(mockTaskInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all tasks with TODO status', async () => {
      // Arrange
      const task1 = Task.create({
        title: 'Task 1',
        description: 'Description 1',
        creatorId: 'test-creator-id',
      });

      const task2 = Task.create({
        title: 'Task 2',
        description: 'Description 2',
        creatorId: 'test-creator-id',
      });

      mockTaskInteractor.findByStatus.mockResolvedValue([task1, task2]);

      // Act
      const result = await useCase.execute(TaskStatus.TODO);

      // Assert
      expect(mockTaskInteractor.findByStatus).toHaveBeenCalledWith(TaskStatus.TODO,);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no tasks with that status exist', async () => {
      // Arrange
      mockTaskInteractor.findByStatus.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(TaskStatus.DONE);

      // Assert
      expect(result).toEqual([]);
    });
  });
});