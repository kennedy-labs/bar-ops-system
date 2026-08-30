import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateDiscrepancySchema = z.object({
  businessId: z.string().min(1),
  branchId: z.string().min(1),
  locationId: z.string().optional(),
  shiftId: z.string().min(1).optional(),
  transferId: z.string().min(1).optional(),
  stockMovementId: z.string().min(1).optional(),
  expenseId: z.string().min(1).optional(),
  productId: z.string().optional(),
  createdById: z.string().min(1).optional(),
  type: z.enum([
    'STOCK_SHORTAGE',
    'CASH_SHORTAGE',
    'MPESA_MISMATCH',
    'TRANSFER_MISMATCH',
    'UNCONFIRMED_ADDITION',
  ]),
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
  expectedQuantity: z.number().optional(),
  actualQuantity: z.number().optional(),
  expectedValue: z.number(),
  actualValue: z.number(),
  variance: z.number().optional(),
  sourceReference: z.string().min(1),
  description: z.string().optional(),
  resolution: z.string().optional(),
});

export class CreateDiscrepancyDto extends createZodDto(
  CreateDiscrepancySchema,
) {}
