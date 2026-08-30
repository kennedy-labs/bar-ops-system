import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMpesaTransactionSchema = z.object({
  businessId: z.string().min(1),
  branchId: z.string().min(1),
  mpesaAccountId: z.string().min(1),
  shiftId: z.string().min(1).optional(),
  transactionReference: z.string().min(1),
  transactionType: z.enum(['PAYBILL', 'POCHI', 'BUY_GOODS_AND_SERVICES', 'SEND_MONEY']),
  amount: z.number().gt(0),
  transactionTime: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'transactionTime must be a valid ISO date string',
    }),
  sender: z.string().optional(),
  receiver: z.string().optional(),
});

export class CreateMpesaTransactionDto extends createZodDto(
  CreateMpesaTransactionSchema,
) {}
