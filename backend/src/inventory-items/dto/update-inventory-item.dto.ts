import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateInventoryItemSchema = z.object({
  branchId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
});

export class UpdateInventoryItemDto extends createZodDto(
  UpdateInventoryItemSchema,
) {}
