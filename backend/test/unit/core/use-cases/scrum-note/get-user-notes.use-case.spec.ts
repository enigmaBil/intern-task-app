import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserNotFoundException } from "@/core/domain/exceptions/user-not-found.exception";
import { IScrumNoteInteractor, IUserInteractor } from "@/core/interactors";
import { GetUserNotesUseCase } from "@/core/use-cases/scrum-note";

describe('GetUserNotesUseCase', () => {
    let useCase: GetUserNotesUseCase;
    let mockScrumNoteRepository: jest.Mocked<IScrumNoteInteractor>;
    let mockUserRepository: jest.Mocked<IUserInteractor>;
    beforeEach(() => {
        mockScrumNoteRepository = {
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
        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            findByRole: jest.fn(),
            exists: jest.fn(),
            emailExists: jest.fn(),
        };

        useCase = new GetUserNotesUseCase(
            mockScrumNoteRepository,
            mockUserRepository,
        );
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('execute', () => {
        it('should return all notes for a user', async () => {
            // Arrange
            const note1 = ScrumNote.create({
                whatIDid: 'Task 1',
                nextSteps: 'Next 1',
                userId: 'user-123',
            });
            const note2 = ScrumNote.create({
                whatIDid: 'Task 2',
                nextSteps: 'Next 2',
                userId: 'user-123',
            });

            const input = { userId: 'user-123' };

            mockUserRepository.exists.mockResolvedValue(true);
            mockScrumNoteRepository.findByUserId.mockResolvedValue([note1, note2]);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockUserRepository.exists).toHaveBeenCalledWith('user-123');
            expect(mockScrumNoteRepository.findByUserId).toHaveBeenCalledWith(
                'user-123',
            );
            expect(result).toHaveLength(2);
        });

        it('should return notes filtered by date range', async () => {
            // Arrange
            const note1 = ScrumNote.create({
                whatIDid: 'Task 1',
                nextSteps: 'Next 1',
                userId: 'user-123',
                date: new Date('2026-01-15'),
            });

            const startDate = new Date('2026-01-01');
            const endDate = new Date('2026-01-31');

            const input = {
                userId: 'user-123',
                startDate,
                endDate,
            };

            mockUserRepository.exists.mockResolvedValue(true);
            mockScrumNoteRepository.findByUserAndDateRange.mockResolvedValue([
                note1,
            ]);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockScrumNoteRepository.findByUserAndDateRange).toHaveBeenCalledWith(
                'user-123',
                startDate,
                endDate,
            );
            expect(result).toHaveLength(1);
        });

        it('should throw UserNotFoundException when user does not exist', async () => {
            // Arrange
            const input = { userId: 'non-existent-user' };

            mockUserRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundException);
            expect(mockScrumNoteRepository.findByUserId).not.toHaveBeenCalled();
        });
    });
});