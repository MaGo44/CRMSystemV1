import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SafeUser, LoginResponse, RegisterCompanyResponse } from './types/user-auth.types';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
    };

    return safeUser;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
  async registerCompany(data: {
    companyName: string;
    email: string;
    password: string;
    name: string;
  }): Promise<RegisterCompanyResponse> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const company = await this.prisma.company.create({
      data: {
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
        users: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: UserRole.COMPANY_ADMIN,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            companyId: true,
            role: true,
          },
        },
      },
    });

    if (!company.users.length) {
      throw new Error('Failed to create associated user');
    }
    const user: SafeUser = {
      id: company.users[0].id,
      email: company.users[0].email,
      name: company.users[0].name,
      companyId: company.users[0].companyId,
      role: company.users[0].role,
    };

    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
    };
  }
}
