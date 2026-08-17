import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMpesaAccountSchema = z.object({
  businessId: z.string().min(1),
  accountIdentifier: z.string().min(1),
  displayName: z.string().min(1),
});

export class CreateMpesaAccountDto extends createZodDto(
  CreateMpesaAccountSchema,
) {}
