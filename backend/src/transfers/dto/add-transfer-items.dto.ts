import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddTransferItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productUnitId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export class AddTransferItemsDto extends createZodDto(AddTransferItemsSchema) {}
