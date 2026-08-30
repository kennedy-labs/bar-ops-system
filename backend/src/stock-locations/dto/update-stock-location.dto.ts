import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateStockLocationSchema = z.object({
  businessId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.enum(['COUNTER', 'STORAGE']).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateStockLocationDto extends createZodDto(
  UpdateStockLocationSchema,
) {}
