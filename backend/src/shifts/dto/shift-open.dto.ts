import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ShiftOpenSchema = z.object({
  branchId: z.string().min(1),
  userId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      openingQuantity: z.number().int().min(0),
    }),
  ),
});

export class ShiftOpenDto extends createZodDto(ShiftOpenSchema) {}