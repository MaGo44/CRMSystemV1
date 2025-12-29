/* eslint-disable no-console */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('🔌 Conectando a PostgreSQL...');
    await this.$connect();
    console.log('✅ Conectado a PostgreSQL');
  }

  async onModuleDestroy() {
    console.log('🔌 Desconectando de PostgreSQL...');
    await this.$disconnect();
    console.log('✅ Desconectado de PostgreSQL');
  }
}
