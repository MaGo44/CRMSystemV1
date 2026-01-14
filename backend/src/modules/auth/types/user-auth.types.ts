import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: SafeUser;
}

export interface RegisterCompanyResponse {
  access_token: string;
  user: SafeUser;
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RequestWithUser extends Request {
  user: SafeUser;
}
