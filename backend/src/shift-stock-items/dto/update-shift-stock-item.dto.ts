import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateShiftStockItemSchema = z.object({
  shiftId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  productUnitId: z.string().min(1).optional(),
  stockLocationId: z.string().optional(),
  businessId: z.string().min(1).optional(),
  branchId: z.string().min(1).optional(),
  openingQuantity: z.number().int().min(0).optional(),
  addedQuantity: z.number().int().min(0).optional(),
  closingQuantity: z.number().int().min(0).optional(),
  soldQuantity: z.number().int().min(0).optional(),
  revenue: z.number().optional(),
  cost: z.number().optional(),
  grossProfit: z.number().optional(),
});

export class UpdateShiftStockItemDto extends createZodDto(
  UpdateShiftStockItemSchema,
) {}
