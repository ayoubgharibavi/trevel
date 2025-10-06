import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { AccountingSetupService } from './accounting-setup.service';
import { AccountingInitializationService } from './accounting-initialization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountingController],
  providers: [AccountingService, AccountingSetupService, AccountingInitializationService],
  exports: [AccountingService, AccountingSetupService]
})
export class AccountingModule {}

