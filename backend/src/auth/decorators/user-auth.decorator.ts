import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../types/user-auth.types';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  }
);
