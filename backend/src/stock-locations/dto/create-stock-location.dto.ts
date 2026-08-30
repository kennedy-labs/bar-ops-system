import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStockLocationSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['COUNTER', 'STORAGE']),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class CreateStockLocationDto extends createZodDto(
  CreateStockLocationSchema,
) {}
