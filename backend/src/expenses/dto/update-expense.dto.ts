import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  branchId: z.string().min(1).optional(),
  createdById: z.string().min(1).optional(),
  status: z.enum(['RECORDED', 'ACKNOWLEDGED']).optional(),
  acknowledgedByUserId: z.string().optional(),
  acknowledgedAt: z.string().optional(),
});

export class UpdateExpenseDto extends createZodDto(UpdateExpenseSchema) {}
