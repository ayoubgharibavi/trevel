
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { FinancialReportsController } from './financial-reports.controller';
import { FinancialReportsService } from './financial-reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [PrismaModule, AccountingModule],
  controllers: [BookingsController, FinancialReportsController],
  providers: [
    BookingsService,
    FinancialReportsService
  ],
  exports: [BookingsService, FinancialReportsService]
})
export class BookingsModule {}
