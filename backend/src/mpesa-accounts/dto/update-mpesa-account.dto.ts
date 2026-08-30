import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMpesaAccountSchema = z.object({
  accountIdentifier: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  accountType: z.enum(['PAYBILL', 'POCHI', 'BUY_GOODS_AND_SERVICES', 'SEND_MONEY']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateMpesaAccountDto extends createZodDto(
  UpdateMpesaAccountSchema,
) {}
