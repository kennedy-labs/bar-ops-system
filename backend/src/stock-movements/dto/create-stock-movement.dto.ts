import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStockMovementSchema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  businessId: z.string().min(1),
  productUnitId: z.string().min(1),
  shiftId: z.string().min(1),
  quantity: z.number().int(),
  type: z.enum([
    'SUPPLIER_DELIVERY',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'DAMAGE',
    'ADJUSTMENT',
    'SHIFT_ADDITION',
  ]),
  stockLocationId: z.string().min(1).optional(),
});

export class CreateStockMovementDto extends createZodDto(
  CreateStockMovementSchema,
) {}
