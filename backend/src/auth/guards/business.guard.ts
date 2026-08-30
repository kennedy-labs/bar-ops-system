import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BusinessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const businessId = request.headers['x-business-id'] as string;
    const user = request.user;

    if (!businessId) {
      throw new BadRequestException('x-business-id header is required');
    }

    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    const hasAccess = user.businesses.some(
      (b: any) => b.businessId === businessId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'User does not have access to this business',
      );
    }

    request.businessId = businessId;
    return true;
  }
}
