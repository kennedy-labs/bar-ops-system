import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1),
  branchId: z.string().optional(),
  role: z.enum(['OWNER', 'WORKER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
