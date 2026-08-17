import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DispatchTransferSchema = z.object({
  userId: z.string().min(1),
});

export class DispatchTransferDto extends createZodDto(DispatchTransferSchema) {}
