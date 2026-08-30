export class MpesaTransactionEntity {
  id: string;
  businessId: string;
  branchId: string;
  mpesaAccountId: string;
  shiftId?: string;
  transactionReference: string;
  transactionType: string;
  amount: number;
  transactionTime: Date;
  sender?: string;
  receiver?: string;
  status: string;
  reconciliationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
