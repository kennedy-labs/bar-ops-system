import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  branchId: z.string().min(1).optional(),
  createdById: z.string().min(1).optional(),
});

export class UpdateExpenseDto extends createZodDto(UpdateExpenseSchema) {}
