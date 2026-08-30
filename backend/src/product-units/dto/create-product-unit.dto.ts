import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductUnitSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  quantity: z.number().int().min(0),
  conversionFactor: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class CreateProductUnitDto extends createZodDto(
  CreateProductUnitSchema,
) {}
