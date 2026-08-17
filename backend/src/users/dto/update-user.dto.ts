import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  businessId: z.string().min(1).optional(),
  role: z.enum(['OWNER', 'MANAGER', 'WORKER']).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
