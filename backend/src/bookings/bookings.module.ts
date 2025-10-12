
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { FinancialReportsController } from './financial-reports.controller';
import { FinancialReportsService } from './financial-reports.service';
import { WalletBlockService } from './wallet-block.service';
import { CRSBookingController } from './crs-booking.controller';
import { CRSBookingService } from './crs-booking.service';
import { SimpleCRSBookingController } from './simple-crs-booking.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';
import { SepehrModule } from '../sepehr/sepehr.module';

@Module({
  imports: [PrismaModule, AccountingModule, SepehrModule],
  controllers: [
    BookingsController, 
    FinancialReportsController,
    CRSBookingController,
    SimpleCRSBookingController,
    AdminBookingsController,
    WalletController
  ],
  providers: [
    BookingsService,
    FinancialReportsService,
    WalletBlockService,
    CRSBookingService
  ],
  exports: [
    BookingsService, 
    FinancialReportsService, 
    WalletBlockService,
    CRSBookingService
  ]
})
export class BookingsModule {}
