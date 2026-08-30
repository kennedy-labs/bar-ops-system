import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  businessId: z.string().min(1).optional(),
  branchId: z.string().optional(),
  role: z.enum(['OWNER', 'WORKER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
