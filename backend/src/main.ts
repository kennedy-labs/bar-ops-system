import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allowed browser origins (CORS). Comma-separated via CORS_ORIGIN env var.
  // Defaults cover local development and the Vercel production frontend domains.
  // In the production environment you can override CORS_ORIGIN as needed.
  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://localhost:3001,https://bar-ops-system.vercel.app,https://bar-ops-system-xpmq.vercel.app'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (health checks, server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Bar Operations System API')
    .setDescription(
      'The API documentation for the Bar Operations Reconciliation & Profit System',
    )
    .setVersion('1.0')
    .addTag('bar-ops')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
