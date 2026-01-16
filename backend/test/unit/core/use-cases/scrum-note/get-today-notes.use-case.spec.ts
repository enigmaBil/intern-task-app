import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { IScrumNoteInteractor } from "@/core/interactors";
import { GetTodayNotesUseCase } from "@/core/use-cases/scrum-note";

describe('GetTodayNotesUseCase', () => {
  let useCase: GetTodayNotesUseCase;
  let mockScrumNoteInteractor: jest.Mocked<IScrumNoteInteractor>;

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

    useCase = new GetTodayNotesUseCase(mockScrumNoteInteractor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all notes for today', async () => {
      // Arrange
      const note1 = ScrumNote.create({
        whatIDid: 'Task 1',
        nextSteps: 'Next 1',
        userId: 'user-1',
      });

      const note2 = ScrumNote.create({
        whatIDid: 'Task 2',
        nextSteps: 'Next 2',
        userId: 'user-2',
      });

      mockScrumNoteInteractor.findToday.mockResolvedValue([note1, note2]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockScrumNoteInteractor.findToday).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ScrumNote);
    });

    it('should return empty array when no notes exist for today', async () => {
      // Arrange
      mockScrumNoteInteractor.findToday.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toEqual([]);
    });
  });
});