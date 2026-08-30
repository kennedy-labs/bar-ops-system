import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => (target: any, key?: any, descriptor?: any) => {
  if (descriptor) {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
  } else {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
  }
};
