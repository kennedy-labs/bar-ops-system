import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProductUnitSchema = z.object({
  productId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

export class UpdateProductUnitDto extends createZodDto(
  UpdateProductUnitSchema,
) {}
