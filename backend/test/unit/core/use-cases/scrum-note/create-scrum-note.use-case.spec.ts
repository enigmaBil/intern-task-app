import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";
import { CreateScrumNoteUseCase } from "@/core/use-cases/scrum-note";

describe('CreateScrumNoteUseCase', () => {
  let useCase: CreateScrumNoteUseCase;
  let mockScrumNoteInteractor: jest.Mocked<IScrumNoteInteractor>;
  let mockUserInteractor: jest.Mocked<IUserInteractor>;

  beforeEach(() => {
    mockScrumNoteInteractor = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByDate: jest.fn(),
      findToday: jest.fn(),
      findByUserAndDate: jest.fn(),
      findByUserAndDateRange: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockUserInteractor = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByRole: jest.fn(),
      exists: jest.fn(),
      emailExists: jest.fn(),
    };

    useCase = new CreateScrumNoteUseCase(mockScrumNoteInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a scrum note when user exists and no note exists for that day', async () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        whatIDid: 'Completed feature X',
        blockers: 'Waiting for API docs',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
      };

      mockUserInteractor.findById.mockResolvedValue(user);
      mockScrumNoteInteractor.findByUserAndDate.mockResolvedValue(null);
      mockScrumNoteInteractor.save.mockImplementation(async (note) => note);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockUserInteractor.findById).toHaveBeenCalledWith('user-123');
      expect(mockScrumNoteInteractor.findByUserAndDate).toHaveBeenCalled();
      expect(mockScrumNoteInteractor.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ScrumNote);
      expect(result.whatIDid).toBe('Completed feature X');
      expect(result.userId).toBe('user-123');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const input = {
        whatIDid: 'Completed feature X',
        nextSteps: 'Implement feature Y',
        userId: 'non-existent-user',
      };

      mockUserInteractor.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
      expect(mockScrumNoteInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw error when note already exists for that day', async () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const existingNote = ScrumNote.create({
        whatIDid: 'Old note',
        nextSteps: 'Old next steps',
        userId: 'user-123',
      });

      const input = {
        whatIDid: 'New note',
        nextSteps: 'New next steps',
        userId: 'user-123',
      };

      mockUserInteractor.findById.mockResolvedValue(user);
      mockScrumNoteInteractor.findByUserAndDate.mockResolvedValue(
        existingNote,
      );

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'A scrum note already exists',
      );
      expect(mockScrumNoteInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw error when whatIDid is empty', async () => {
      // Arrange
      const user = User.reconstitute({
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        whatIDid: '', // Invalid
        nextSteps: 'Next steps',
        userId: 'user-123',
      };

      mockUserInteractor.findById.mockResolvedValue(user);
      mockScrumNoteInteractor.findByUserAndDate.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        'What I did cannot be empty',
      );
      expect(mockScrumNoteInteractor.save).not.toHaveBeenCalled();
    });
  });
});
