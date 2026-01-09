import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RoleCategory } from '../types/user-roles.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

export const MinRole = (minRole: UserRole) => SetMetadata('minRole', minRole);

export const RoleType = (category: RoleCategory) => SetMetadata('role_category', category);
