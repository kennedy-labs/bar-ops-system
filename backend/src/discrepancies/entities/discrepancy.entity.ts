export class DiscrepancyEntity {
  id: string;
  businessId: string;
  branchId: string;
  locationId?: string;
  shiftId?: string;
  transferId?: string;
  stockMovementId?: string;
  expenseId?: string;
  productId?: string;
  createdById?: string;
  type: string;
  status: string;
  expectedQuantity?: number;
  actualQuantity?: number;
  expectedValue: number;
  actualValue: number;
  variance?: number;
  description?: string;
  sourceReference: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}
