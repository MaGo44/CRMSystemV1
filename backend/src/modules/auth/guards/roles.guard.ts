import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RoleCategory, hasPermission, isInCategory } from '../types/user-roles.enum';
import { RequestWithUser } from '../types/user-auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const minRole = this.reflector.getAllAndOverride<UserRole>('minRole', [
      context.getHandler(),
      context.getClass(),
    ]);

    const roleCategory = this.reflector.getAllAndOverride<RoleCategory>('role_category', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !minRole && !roleCategory) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (requiredRoles && !requiredRoles.some((role) => hasPermission(user.role, role))) {
      throw new ForbiddenException('El usuario no tiene los roles necesarios');
    }

    if (minRole && requiredRoles) {
      throw new Error('No usar @Roles y @MinRole juntos');
    }

    if (minRole && !hasPermission(user.role, minRole)) {
      throw new ForbiddenException('El usuario no tiene el rol mínimo requerido');
    }

    if (roleCategory && !isInCategory(user.role, roleCategory)) {
      throw new ForbiddenException('El usuario no pertenece a la categoría requerida');
    }

    return true;
  }
}
