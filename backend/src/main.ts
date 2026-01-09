/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Review CRM API')
    .setDescription('API para gestión de reseñas de empresas')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación de usuarios')
    .addTag('companies', 'Gestión de empresas')
    .addTag('reviews', 'Gestión de reseñas')
    .addTag('customers', 'Gestión de clientes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Review CRM API Docs',
    swaggerOptions: {
      persistAuthorization: true, // Mantener token entre sesiones
      tagsSorter: 'alpha', // Ordenar tags alfabéticamente
      operationsSorter: 'alpha', // Ordenar operaciones
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    })
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API: http://localhost:3000`);
  console.log(`📚 Docs: http://localhost:3000/api/docs`);
}
bootstrap();
