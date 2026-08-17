import { TransferItem } from './transfer-item.entity';

export interface Transfer {
  id: string;
  businessId: string;
  senderBranchId: string;
  receiverBranchId: string;
  senderUserId: string;
  receiverUserId?: string | null;
  status:
    'PENDING' | 'SENDER_CONFIRMED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  notes?: string | null;
  dispatchedAt?: Date | null;
  receivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: TransferItem[];
}
