import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
