import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTransferSchema = z.object({
  businessId: z.string().min(1),

  senderBranchId: z.string().min(1),
  receiverBranchId: z.string().min(1),

  senderUserId: z.string().min(1),
  receiverUserId: z.string().min(1).optional(),

  notes: z.string().optional(),
});

export class CreateTransferDto extends createZodDto(CreateTransferSchema) {}
