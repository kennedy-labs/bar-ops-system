import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateShiftSchema = z.object({
  openedAt: z.string().optional(),
  closedAt: z.string().nullable().optional(),
  branchId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

export class UpdateShiftDto extends createZodDto(UpdateShiftSchema) {}
