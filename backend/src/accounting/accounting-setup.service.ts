import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountingSetupService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultAccounts();
  }

  private async ensureDefaultAccounts() {
    console.log('📊 Ensuring default accounting accounts exist...');

    const defaultAccounts = [
      // Assets (1000)
      { 
        id: '1000', 
        name: 'دارایی‌ها (Assets)', 
        code: '1000', 
        type: AccountType.ASSET, 
        parentId: null, 
        isParent: true, 
        balance: 0, 
        currency: 'IRR' 
      },
      { 
        id: '1010', 
        name: 'نقد و معادل نقد (Cash)', 
        code: '1010', 
        type: AccountType.ASSET, 
        parentId: '1000', 
        isParent: false, 
        balance: 0, 
        currency: 'IRR' 
      },
      { 
        id: '1020', 
        name: 'حساب‌های دریافتنی (Receivables)', 
        code: '1020', 
        type: AccountType.ASSET, 
        parentId: '1000', 
        isParent: false, 
        balance: 0, 
        currency: 'IRR' 
      },

      // Liabilities (2000)
      { 
        id: '2000', 
        name: 'بدهی‌ها (Liabilities)', 
        code: '2000', 
        type: AccountType.LIABILITY, 
        parentId: null, 
        isParent: true, 
        balance: 0, 
        currency: 'IRR' 
      },
      { 
        id: '2010', 
        name: 'بدهی به مشتری - کیف پول (Customer Liability)', 
        code: '2010', 
        type: AccountType.LIABILITY, 
        parentId: '2000', 
        isParent: false, 
        balance: 0, 
        currency: 'IRR' 
      },

      // Revenue (4000)
      { 
        id: '4000', 
        name: 'درآمدها (Revenue)', 
        code: '4000', 
        type: AccountType.REVENUE, 
        parentId: null, 
        isParent: true, 
        balance: 0, 
        currency: 'IRR' 
      },
      { 
        id: '4010', 
        name: 'درآمد فروش بلیط (Ticket Sales)', 
        code: '4010', 
        type: AccountType.REVENUE, 
        parentId: '4000', 
        isParent: false, 
        balance: 0, 
        currency: 'IRR' 
      },

      // Expenses (5000)
      { 
        id: '5000', 
        name: 'هزینه‌ها (Expenses)', 
        code: '5000', 
        type: AccountType.EXPENSE, 
        parentId: null, 
        isParent: true, 
        balance: 0, 
        currency: 'IRR' 
      },
      { 
        id: '5010', 
        name: 'هزینه خرید بلیط (Ticket Cost)', 
        code: '5010', 
        type: AccountType.EXPENSE, 
        parentId: '5000', 
        isParent: false, 
        balance: 0, 
        currency: 'IRR' 
      },
    ];

    for (const accountData of defaultAccounts) {
      await this.prisma.account.upsert({
        where: { id: accountData.id },
        update: {
          name: accountData.name,
          code: accountData.code,
          type: accountData.type,
          parentId: accountData.parentId,
          isParent: accountData.isParent,
          currency: accountData.currency,
        },
        create: accountData,
      });
    }
    console.log('✅ Default accounting accounts ensured.');
  }

  async initializeAccounts() {
    console.log('🔧 Initializing accounting accounts...');
    await this.ensureDefaultAccounts();
    console.log('✅ Accounting accounts initialized successfully');
  }

  async getAccountById(accountId: string) {
    return this.prisma.account.findUnique({
      where: { id: accountId }
    });
  }
}









