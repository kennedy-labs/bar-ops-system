import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateStockLocationSchema = z.object({
  branchId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.enum(['COUNTER', 'STORAGE']).optional(),
});

export class UpdateStockLocationDto extends createZodDto(
  UpdateStockLocationSchema,
) {}
