import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateDiscrepancySchema = z.object({
  type: z.string().optional(),
  description: z.string().optional(),
  expectedQuantity: z.number().optional(),
  actualQuantity: z.number().optional(),
  expectedValue: z.number().optional(),
  actualValue: z.number().optional(),
  variance: z.number().optional(),
  resolution: z.string().optional(),
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
  branchId: z.string().optional(),
  locationId: z.string().optional(),
  shiftId: z.string().optional(),
  transferId: z.string().optional(),
  stockMovementId: z.string().optional(),
  expenseId: z.string().optional(),
  createdById: z.string().optional(),
});

export class UpdateDiscrepancyDto extends createZodDto(
  UpdateDiscrepancySchema,
) {}
