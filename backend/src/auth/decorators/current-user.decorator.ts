import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  id: string;
  name: string;
  role: string;
  businesses: {
    businessId: string;
    role: string;
    business: {
      id: string;
      name: string;
      currency: string;
    };
  }[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const BusinessId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const businessId = request.headers['x-business-id'] as string;
    if (!businessId) {
      throw new Error('x-business-id header is required');
    }
    return businessId;
  },
);
