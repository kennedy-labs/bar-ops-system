import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProductUnitSchema = z.object({
  productId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  symbol: z.string().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  conversionFactor: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateProductUnitDto extends createZodDto(
  UpdateProductUnitSchema,
) {}
