import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateInventoryItemSchema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(0),
});

export class CreateInventoryItemDto extends createZodDto(
  CreateInventoryItemSchema,
) {}
