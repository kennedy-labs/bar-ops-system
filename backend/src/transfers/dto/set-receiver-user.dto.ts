import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SetReceiverUserSchema = z.object({
  receiverUserId: z.string().min(1),
});

export class SetReceiverUserDto extends createZodDto(SetReceiverUserSchema) {}
