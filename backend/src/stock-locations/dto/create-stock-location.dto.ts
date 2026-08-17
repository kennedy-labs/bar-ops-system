import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStockLocationSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['COUNTER', 'STORAGE']),
});

export class CreateStockLocationDto extends createZodDto(
  CreateStockLocationSchema,
) {}
