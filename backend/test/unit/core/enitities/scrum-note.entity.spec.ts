import { ScrumNote } from "@/core/domain/entities/scrum-note.entity";
import { UserRole } from "@/core/domain/enums/user-role.enum";

/**
 * Tests unitaires pour l'entité ScrumNote
 * Tests PURS sans dépendances framework
 */
describe('ScrumNote Entity', () => {
  describe('create', () => {
    it('should create a new scrum note with valid data', () => {
      // Arrange
      const data = {
        whatIDid: 'Completed feature X',
        blockers: 'Waiting for API documentation',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
      };

      // Act
      const note = ScrumNote.create(data);

      // Assert
      expect(note.id).toBeDefined();
      expect(note.whatIDid).toBe('Completed feature X');
      expect(note.blockers).toBe('Waiting for API documentation');
      expect(note.nextSteps).toBe('Implement feature Y');
      expect(note.userId).toBe('user-123');
      expect(note.date).toBeInstanceOf(Date);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a scrum note without blockers', () => {
      // Arrange
      const data = {
        whatIDid: 'Completed feature X',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
      };

      // Act
      const note = ScrumNote.create(data);

      // Assert
      expect(note.blockers).toBe('');
    });

    it('should normalize date to start of day', () => {
      // Arrange
      const specificTime = new Date('2026-01-15T14:30:00');
      const data = {
        whatIDid: 'Completed feature X',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
        date: specificTime,
      };

      // Act
      const note = ScrumNote.create(data);

      // Assert
      const expectedDate = new Date('2026-01-15T00:00:00');
      expect(note.date.getHours()).toBe(0);
      expect(note.date.getMinutes()).toBe(0);
      expect(note.date.getSeconds()).toBe(0);
      expect(note.date.getMilliseconds()).toBe(0);
    });

    it('should trim whitespace from fields', () => {
      // Arrange
      const data = {
        whatIDid: '  Completed feature X  ',
        blockers: '  Waiting for docs  ',
        nextSteps: '  Implement feature Y  ',
        userId: 'user-123',
      };

      // Act
      const note = ScrumNote.create(data);

      // Assert
      expect(note.whatIDid).toBe('Completed feature X');
      expect(note.blockers).toBe('Waiting for docs');
      expect(note.nextSteps).toBe('Implement feature Y');
    });

    it('should throw error if whatIDid is empty', () => {
      // Arrange
      const data = {
        whatIDid: '',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
      };

      // Act & Assert
      expect(() => ScrumNote.create(data)).toThrow('What I did cannot be empty');
    });

    it('should throw error if nextSteps is empty', () => {
      // Arrange
      const data = {
        whatIDid: 'Completed feature X',
        nextSteps: '',
        userId: 'user-123',
      };

      // Act & Assert
      expect(() => ScrumNote.create(data)).toThrow('Next steps cannot be empty');
    });

    it('should throw error if userId is missing', () => {
      // Arrange
      const data = {
        whatIDid: 'Completed feature X',
        nextSteps: 'Implement feature Y',
        userId: '',
      };

      // Act & Assert
      expect(() => ScrumNote.create(data as any)).toThrow('User ID is required');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a scrum note from database data', () => {
      // Arrange
      const data = {
        id: 'note-123',
        date: new Date('2026-01-15'),
        whatIDid: 'Completed feature X',
        blockers: 'Waiting for docs',
        nextSteps: 'Implement feature Y',
        userId: 'user-123',
        createdAt: new Date('2026-01-15T08:00:00'),
        updatedAt: new Date('2026-01-15T08:00:00'),
      };

      // Act
      const note = ScrumNote.reconstitute(data);

      // Assert
      expect(note.id).toBe('note-123');
      expect(note.whatIDid).toBe('Completed feature X');
      expect(note.userId).toBe('user-123');
    });
  });

  describe('update', () => {
    it('should update whatIDid field', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Old task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      note.update({ whatIDid: 'New task' });

      // Assert
      expect(note.whatIDid).toBe('New task');
    });

    it('should update blockers field', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      note.update({ blockers: 'New blocker' });

      // Assert
      expect(note.blockers).toBe('New blocker');
    });

    it('should update nextSteps field', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Old next steps',
        userId: 'user-123',
      });

      // Act
      note.update({ nextSteps: 'New next steps' });

      // Assert
      expect(note.nextSteps).toBe('New next steps');
    });

    it('should clear blockers when updated with empty string', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        blockers: 'Some blocker',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      note.update({ blockers: '' });

      // Assert
      expect(note.blockers).toBe('');
    });

    it('should throw error when updating whatIDid with empty string', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act & Assert
      expect(() => note.update({ whatIDid: '' })).toThrow(
        'What I did cannot be empty',
      );
    });

    it('should throw error when updating nextSteps with empty string', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act & Assert
      expect(() => note.update({ nextSteps: '' })).toThrow(
        'Next steps cannot be empty',
      );
    });

    it('should update updatedAt timestamp', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });
      const originalUpdatedAt = note.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      // Act
      note.update({ whatIDid: 'New task' });

      // Assert
      expect(note.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      jest.useRealTimers();
    });
  });

  describe('belongsToUser', () => {
    it('should return true when note belongs to the user', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      const result = note.belongsToUser('user-123');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when note belongs to different user', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      const result = note.belongsToUser('user-456');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeModifiedBy', () => {
    it('should return true when user is ADMIN', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
      });

      // Act
      const result = note.canBeModifiedBy('admin-456', UserRole.ADMIN);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when INTERN owns the note', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'intern-123',
      });

      // Act
      const result = note.canBeModifiedBy('intern-123', UserRole.INTERN);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when INTERN does not own the note', () => {
      // Arrange
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'intern-123',
      });

      // Act
      const result = note.canBeModifiedBy('intern-456', UserRole.INTERN);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true when note date is today', () => {
      // Arrange
      const today = new Date();
      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
        date: today,
      });

      // Act
      const result = note.isToday();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when note date is not today', () => {
      // Arrange
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
        date: yesterday,
      });

      // Act
      const result = note.isToday();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true even with different times on same day', () => {
      // Arrange
      const morning = new Date();
      morning.setHours(8, 0, 0, 0);

      const note = ScrumNote.create({
        whatIDid: 'Completed task',
        nextSteps: 'Next task',
        userId: 'user-123',
        date: morning,
      });

      // Act
      const result = note.isToday();

      // Assert
      expect(result).toBe(true);
    });
  });
});