export interface Shift {
  id: string;
  userId: string;
  branchId: string;
  openedAt: Date;
  closedAt: Date | null;
}
