import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CancelTransferSchema = z.object({
  userId: z.string().min(1),
  notes: z.string().optional(),
});

export class CancelTransferDto extends createZodDto(CancelTransferSchema) {}
