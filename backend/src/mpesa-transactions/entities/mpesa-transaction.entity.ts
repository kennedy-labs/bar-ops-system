export class MpesaTransactionEntity {
  id: string;
  businessId: string;
  mpesaAccountId: string;
  shiftId?: string;
  externalTransactionId: string;
  amount: number;
  transactionTime: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
