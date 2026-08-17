import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductCostHistorySchema = z.object({
  productId: z.string().min(1),
  costPrice: z.number().positive(),
  effectiveAt: z.string().optional(),
});

export class CreateProductCostHistoryDto extends createZodDto(
  CreateProductCostHistorySchema,
) {}
