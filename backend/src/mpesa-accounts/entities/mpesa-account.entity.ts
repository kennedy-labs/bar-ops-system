import { MpesaAccountStatus } from '@prisma/client';
import { MpesaAccountType } from '@prisma/client';

export class MpesaAccountEntity {
  id: string;
  businessId: string;
  branchId: string;
  accountIdentifier: string;
  displayName: string;
  accountType: MpesaAccountType;
  status: MpesaAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}
