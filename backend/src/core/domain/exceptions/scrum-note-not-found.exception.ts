/**
 * Exception levée lorsqu'une note de scrum n'est pas trouvée
 */
export class ScrumNoteNotFoundException extends Error {
  public readonly scrumNoteId: string;

  constructor(scrumNoteId: string) {
    super(`Scrum note with id "${scrumNoteId}" not found`);
    this.name = 'ScrumNoteNotFoundException';
    this.scrumNoteId = scrumNoteId;
    
    Object.setPrototypeOf(this, ScrumNoteNotFoundException.prototype);
  }
}