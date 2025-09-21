import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Apply comprehensive security middleware
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  //       fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
  //       imgSrc: ["'self'", "data:", "https:"],
  //       scriptSrc: ["'self'"],
  //       connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175"],
  //       frameSrc: ["'none'"],
  //     },
  //   },
  //   crossOriginResourcePolicy: { policy: 'cross-origin' },
  //   hsts: {
  //     maxAge: 31536000,
  //     includeSubDomains: true,
  //     preload: true
  //   },
  //   noSniff: true,
  //   xssFilter: true,
  //   referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  // }));
  
  // Apply CORS first, before other middleware
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // app.use(compression());
  // app.use(cookieParser());
  // app.use(morgan('combined'));

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  
  // Enable comprehensive input validation
  // app.useGlobalPipes(new ValidationPipe({ 
  //   whitelist: false,
  //   transform: true, 
  //   forbidNonWhitelisted: false,
  //   disableErrorMessages: false,
  //   validateCustomDecorators: true,
  //   transformOptions: {
  //     enableImplicitConversion: false,
  //   },
  // }));

  // Apply global JWT Auth Guard with proper public route handling
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector, configService));

  // Apply global BigInt serializer interceptor
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  // Apply the global exception filter
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('Trevel API')
    .setDescription('API documentation for Trevel backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
