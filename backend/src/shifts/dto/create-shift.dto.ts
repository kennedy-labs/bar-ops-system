import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateShiftSchema = z.object({
  branchId: z.string().min(1),
  userId: z.string().min(1),
});

export class CreateShiftDto extends createZodDto(CreateShiftSchema) {}
