import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProductCostHistorySchema = z.object({
  productId: z.string().min(1).optional(),
  costPrice: z.number().positive().optional(),
  effectiveAt: z.string().optional(),
});

export class UpdateProductCostHistoryDto extends createZodDto(
  UpdateProductCostHistorySchema,
) {}
