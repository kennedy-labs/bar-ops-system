import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1),
  role: z.enum(['OWNER', 'MANAGER', 'WORKER']).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
