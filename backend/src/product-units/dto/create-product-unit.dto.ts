import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductUnitSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
});

export class CreateProductUnitDto extends createZodDto(
  CreateProductUnitSchema,
) {}
