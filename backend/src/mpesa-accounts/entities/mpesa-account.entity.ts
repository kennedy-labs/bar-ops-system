import { MpesaAccountStatus } from '@prisma/client';

export class MpesaAccountEntity {
  id: string;
  businessId: string;
  accountIdentifier: string;
  displayName: string;
  status: MpesaAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}
