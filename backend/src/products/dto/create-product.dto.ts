import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  sellingPrice: z.number().positive(),
  businessId: z.string().min(1),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
