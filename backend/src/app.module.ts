import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FlightsModule } from './flights/flights.module';
import { ContentModule } from './content/content.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { RefundsModule } from './refunds/refunds.module';
import { AccountingModule } from './accounting/accounting.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { SepehrModule } from './sepehr/sepehr.module';
import { AdvertisementModule } from './advertisements/advertisement.module';
import { Charter118Module } from './charter118/charter118.module';
import { ApiManagementModule } from './api-management/api-management.module';
import { LoadingSettingsModule } from './loading-settings/loading-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ContentModule,
    AdminModule,
    FlightsModule,
    TicketsModule,
    UsersModule,
    BookingsModule,
    RefundsModule,
    AccountingModule,
    IntegrationsModule,
    ExchangeRatesModule,
    SepehrModule,
    AdvertisementModule,
    Charter118Module,
    ApiManagementModule,
    LoadingSettingsModule,
  ],
})
export class AppModule {}
