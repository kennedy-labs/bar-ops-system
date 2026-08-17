import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateStockMovementSchema = z.object({
  branchId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  shiftId: z.string().min(1).optional(),
  quantity: z.number().int().optional(),
  type: z
    .enum([
      'SUPPLIER_DELIVERY',
      'TRANSFER_IN',
      'TRANSFER_OUT',
      'DAMAGE',
      'ADJUSTMENT',
      'SHIFT_ADDITION',
    ])
    .optional(),
  stockLocationId: z.string().min(1).optional(),
});

export class UpdateStockMovementDto extends createZodDto(
  UpdateStockMovementSchema,
) {}
