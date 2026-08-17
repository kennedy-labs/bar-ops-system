import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBusinessSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currency: z.string().min(1).default('KES'),
  timezone: z.string().min(1).default('Africa/Nairobi'),
});

export class CreateBusinessDto extends createZodDto(CreateBusinessSchema) {}
