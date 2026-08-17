import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReceiveTransferSchema = z.object({
  userId: z.string().min(1),
});

export class ReceiveTransferDto extends createZodDto(ReceiveTransferSchema) {}
