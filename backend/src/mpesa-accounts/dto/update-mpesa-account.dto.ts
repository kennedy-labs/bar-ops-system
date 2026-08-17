import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMpesaAccountSchema = z.object({
  accountIdentifier: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
});

export class UpdateMpesaAccountDto extends createZodDto(
  UpdateMpesaAccountSchema,
) {}
