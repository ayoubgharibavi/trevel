import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FlightsModule } from '../flights/flights.module';
import { FlightsService } from '../flights/flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    FlightsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '24h' },
    }),
    ConfigModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    FlightsService,
    JwtAuthGuard,
    ConfigService,
  ],
})
export class AdminModule {}
