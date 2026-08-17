import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  branchId: z.string().min(1),
  createdById: z.string().min(1).optional(),
});

export class CreateExpenseDto extends createZodDto(CreateExpenseSchema) {}
