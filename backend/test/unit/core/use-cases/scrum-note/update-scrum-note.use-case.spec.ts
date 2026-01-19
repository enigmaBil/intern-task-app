import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { User } from "@/core/domain/entities/user.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";
import { ScrumNoteNotFoundException } from "@/core/domain/exceptions/scrum-note-not-found.exception";
import { UnauthorizedException } from "@/core/domain/exceptions/unauthorized.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";
import { UpdateScrumNoteUseCase } from "@/core/use-cases/scrum-note";

describe('UpdateScrumNoteUseCase', () => {
  let useCase: UpdateScrumNoteUseCase;
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

    useCase = new UpdateScrumNoteUseCase(mockScrumNoteInteractor, mockUserInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update note when user owns the note', async () => {
        // Arrange
        const note = ScrumNote.create({
        whatIDid: 'Old task',
        nextSteps: 'Old next steps',
        userId: 'intern-123',
        });

        const intern = User.reconstitute({
        id: 'intern-123',
        email: 'intern@test.com',
        firstName: 'Intern User',
        lastName: 'Internson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
        });

        const input = {
        noteId: 'note-123',
        whatIDid: 'New task',
        userId: 'intern-123',
        };

        mockScrumNoteInteractor.findById.mockResolvedValue(note);
        mockUserInteractor.findById.mockResolvedValue(intern);
        mockScrumNoteInteractor.save.mockImplementation(async (n) => n);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.whatIDid).toBe('New task');
        expect(mockScrumNoteInteractor.save).toHaveBeenCalled();
    });

    it('should update note when user is admin', async () => {
        // Arrange
        const note = ScrumNote.create({
        whatIDid: 'Old task',
        nextSteps: 'Old next steps',
        userId: 'intern-123',
        });

        const admin = User.reconstitute({
        id: 'admin-456',
        email: 'admin@test.com',
        firstName: 'Admin User',
        lastName: 'Adminson',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
        });

        const input = {
        noteId: 'note-123',
        whatIDid: 'New task',
        userId: 'admin-456',
        };

        mockScrumNoteInteractor.findById.mockResolvedValue(note);
        mockUserInteractor.findById.mockResolvedValue(admin);
        mockScrumNoteInteractor.save.mockImplementation(async (n) => n);
        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.whatIDid).toBe('New task');
    });

    it('should throw UnauthorizedException when intern tries to update another user note', async () => {
        // Arrange
        const note = ScrumNote.create({
        whatIDid: 'Task',
        nextSteps: 'Next steps',
        userId: 'intern-123',
        });

        const otherIntern = User.reconstitute({
        id: 'intern-456',
        email: 'intern2@test.com',
        firstName: 'Other Intern',
        lastName: 'Internson',
        role: UserRole.INTERN,
        createdAt: new Date(),
        updatedAt: new Date(),
        });

        const input = {
        noteId: 'note-123',
        whatIDid: 'New task',
        userId: 'intern-456',
        };

        mockScrumNoteInteractor.findById.mockResolvedValue(note);
        mockUserInteractor.findById.mockResolvedValue(otherIntern);
        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
        expect(mockScrumNoteInteractor.save).not.toHaveBeenCalled();
    });

    it('should throw ScrumNoteNotFoundException when note does not exist', async () => {
        // Arrange
        const input = {
            noteId: 'non-existent-note',
            whatIDid: 'New task',
            userId: 'user-123',
        };

        mockScrumNoteInteractor.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(ScrumNoteNotFoundException);
        });
    });
});