import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountingSetupService } from './accounting-setup.service';

@Injectable()
export class AccountingInitializationService implements OnModuleInit {
  constructor(private accountingSetup: AccountingSetupService) {}

  async onModuleInit() {
    console.log('🔧 Accounting initialization service started');
  }
}


