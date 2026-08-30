import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMpesaAccountSchema = z.object({
  businessId: z.string().min(1),
  branchId: z.string().min(1),
  accountIdentifier: z.string().min(1),
  displayName: z.string().min(1),
  accountType: z.enum(['PAYBILL', 'POCHI', 'BUY_GOODS_AND_SERVICES', 'SEND_MONEY']),
});

export class CreateMpesaAccountDto extends createZodDto(
  CreateMpesaAccountSchema,
) {}
