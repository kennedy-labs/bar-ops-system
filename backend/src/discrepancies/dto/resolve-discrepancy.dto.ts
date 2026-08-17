import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResolveDiscrepancySchema = z.object({
  resolution: z.string().min(1),
  status: z.literal('RESOLVED').optional(),
});

export class ResolveDiscrepancyDto extends createZodDto(
  ResolveDiscrepancySchema,
) {}
