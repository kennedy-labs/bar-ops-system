import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RejectTransferSchema = z.object({
  userId: z.string().min(1),
  notes: z.string().optional(),
});

export class RejectTransferDto extends createZodDto(RejectTransferSchema) {}
