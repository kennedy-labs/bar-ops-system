export class DiscrepancyEntity {
  id: string;
  businessId: string;
  branchId: string;
  shiftId?: string;
  transferId?: string;
  stockMovementId?: string;
  expenseId?: string;
  createdById?: string;
  type: string;
  status: string;
  expectedValue: number;
  actualValue: number;
  variance?: number;
  description?: string;
  sourceReference: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}
