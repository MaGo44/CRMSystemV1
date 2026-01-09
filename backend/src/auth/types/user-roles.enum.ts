import { UserRole } from '@prisma/client';

export enum RoleCategory {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  COMPANY_USER = 'COMPANY_USER',
}

export const RoleConfig: {
  hierarchy: Record<UserRole, number>;
  categories: Record<RoleCategory, readonly UserRole[]>;
} = {
  hierarchy: {
    [UserRole.SUPER_ADMIN]: 100,
    [UserRole.SUPPORT]: 90,
    [UserRole.COMPANY_ADMIN]: 50,
    [UserRole.COMPANY_SUPPORT]: 30,
  },

  categories: {
    [RoleCategory.PLATFORM_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.SUPPORT],
    [RoleCategory.COMPANY_USER]: [UserRole.COMPANY_ADMIN, UserRole.COMPANY_SUPPORT],
  },
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return RoleConfig.hierarchy[userRole] >= RoleConfig.hierarchy[requiredRole];
}

export function isInCategory(userRole: UserRole, category: RoleCategory): boolean {
  return RoleConfig.categories[category].includes(userRole);
}
