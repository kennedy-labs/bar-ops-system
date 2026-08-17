import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMpesaTransactionSchema = z.object({
  businessId: z.string().min(1),
  mpesaAccountId: z.string().min(1),
  shiftId: z.string().min(1).optional(),
  externalTransactionId: z.string().min(1),
  amount: z.number().gt(0),
  transactionTime: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'transactionTime must be a valid ISO date string',
    }),
});

export class CreateMpesaTransactionDto extends createZodDto(
  CreateMpesaTransactionSchema,
) {}
