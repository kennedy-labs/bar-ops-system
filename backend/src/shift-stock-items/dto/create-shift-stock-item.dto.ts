import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateShiftStockItemSchema = z.object({
  shiftId: z.string().min(1),
  productId: z.string().min(1),
  productUnitId: z.string().min(1),
  stockLocationId: z.string().optional(),
  businessId: z.string().min(1),
  branchId: z.string().min(1),
  openingQuantity: z.number().int().min(0),
  addedQuantity: z.number().int().min(0).optional(),
  closingQuantity: z.number().int().min(0).optional(),
});

export class CreateShiftStockItemDto extends createZodDto(
  CreateShiftStockItemSchema,
) {}
