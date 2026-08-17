import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  businessId: z.string().min(1).optional(),
});

export class UpdateBranchDto extends createZodDto(UpdateBranchSchema) {}
