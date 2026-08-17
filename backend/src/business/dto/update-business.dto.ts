import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currency: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});

export class UpdateBusinessDto extends createZodDto(UpdateBusinessSchema) {}
