import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS config
  app.enableCors({
    origin: true, // Allow all origins for dev; replace with actual allowed domains in production
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // API Versioning (URI based: /api/v1)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe (Strict class-validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips any request property not matching DTO properties
      transform: true, // Transforms primitive types to DTO instances
      forbidNonWhitelisted: true, // Rejects requests with fields not explicitly whitelisted in DTO
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription(
      'The API documentation for the scalable production-ready NestJS starter project',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
