export interface ScrumNote {
  id: string;
  userId: string;
  date: Date;
  whatDidYesterday: string;
  whatWillDoToday: string;
  blockers: string;
  createdAt: Date;
  updatedAt: Date;
}
