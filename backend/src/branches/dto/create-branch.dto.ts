import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBranchSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1),
});

export class CreateBranchDto extends createZodDto(CreateBranchSchema) {}
