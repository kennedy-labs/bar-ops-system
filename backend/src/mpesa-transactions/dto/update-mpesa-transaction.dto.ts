import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMpesaTransactionSchema = z.object({
  status: z.enum(['RECEIVED', 'RECONCILED', 'DISPUTED']).optional(),
});

export class UpdateMpesaTransactionDto extends createZodDto(
  UpdateMpesaTransactionSchema,
) {}
