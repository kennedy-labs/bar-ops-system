import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CloseShiftSchema = z.object({
  shiftId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      actualQuantity: z.number().int().min(0),
      addedQuantity: z.number().int().min(0).optional(),
    }),
  ),
});

export class CloseShiftDto extends createZodDto(CloseShiftSchema) {}