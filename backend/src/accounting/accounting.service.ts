import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingService {
  async getOverview() {
    // Mock accounting overview - replace with Prisma when DB is ready
    return {
      totalRevenue: 850000000,
      totalExpenses: 120000000,
      netIncome: 730000000,
      totalAssets: 2500000000,
      totalLiabilities: 450000000,
      equity: 2050000000,
      cashFlow: 680000000,
      recentTransactions: [
        {
          id: 'JE-001',
          date: new Date().toISOString(),
          description: 'رزرو پرواز IR-452',
          amount: 11000000
        }
      ],
      monthlyRevenue: [
        { month: 'فروردین', revenue: 120000000 },
        { month: 'اردیبهشت', revenue: 140000000 },
        { month: 'خرداد', revenue: 180000000 },
        { month: 'تیر', revenue: 200000000 }
      ]
    };
  }

  async getChartOfAccounts() {
    // Mock chart of accounts - replace with Prisma when DB is ready
    return [
      {
        id: '1000',
        name: { fa: 'دارایی‌ها', en: 'Assets', ar: 'الأصول' },
        type: 'Asset',
        isParent: true,
        parentId: null
      },
      {
        id: '1010',
        name: { fa: 'نقد و معادل نقد', en: 'Cash and Cash Equivalents', ar: 'النقد ومعادل النقد' },
        type: 'Asset',
        isParent: false,
        parentId: '1000'
      },
      {
        id: '1020',
        name: { fa: 'حساب‌های دریافتنی', en: 'Accounts Receivable', ar: 'الحسابات المدينة' },
        type: 'Asset',
        isParent: false,
        parentId: '1000'
      },
      {
        id: '2000',
        name: { fa: 'بدهی‌ها', en: 'Liabilities', ar: 'الخصوم' },
        type: 'Liability',
        isParent: true,
        parentId: null
      },
      {
        id: '4000',
        name: { fa: 'درآمدها', en: 'Revenues', ar: 'الإيرادات' },
        type: 'Revenue',
        isParent: true,
        parentId: null
      },
      {
        id: '4011',
        name: { fa: 'درآمد فروش بلیط', en: 'Ticket Sales Revenue', ar: 'إيرادات مبيعات التذاكر' },
        type: 'Revenue',
        isParent: false,
        parentId: '4000'
      },
      {
        id: '5000',
        name: { fa: 'هزینه‌ها', en: 'Expenses', ar: 'المصروفات' },
        type: 'Expense',
        isParent: true,
        parentId: null
      }
    ];
  }

  async createAccount(data: any) {
    // Mock account creation - replace with Prisma when DB is ready
    return {
      success: true,
      account: { id: data.id, ...data },
      message: 'حساب جدید ایجاد شد'
    };
  }

  async updateAccount(accountId: string, data: any) {
    // Mock account update - replace with Prisma when DB is ready
    return {
      success: true,
      message: 'حساب به‌روزرسانی شد'
    };
  }

  async getJournalEntries(startDate?: string, endDate?: string) {
    // Mock journal entries - replace with Prisma when DB is ready
    return [
      {
        id: 'JE-001',
        date: new Date().toISOString(),
        description: 'رزرو پرواز IR-452 توسط احمد محمدی',
        transactions: [
          { accountId: '1020', debit: 11000000, credit: 0 },
          { accountId: '4011', debit: 0, credit: 10000000 },
          { accountId: '2020', debit: 0, credit: 1000000 }
        ],
        userId: 'user-1'
      }
    ];
  }

  async createJournalEntry(data: any) {
    // Mock journal entry creation - replace with Prisma when DB is ready
    return {
      success: true,
      entry: { id: `JE-${Date.now()}`, ...data },
      message: 'سند حسابداری ایجاد شد'
    };
  }

  async getExpenses(startDate?: string, endDate?: string) {
    // Mock expenses - replace with Prisma when DB is ready
    return [
      {
        id: 'EXP-001',
        description: 'هزینه دفتری',
        amount: 2000000,
        accountId: '5010',
        date: new Date().toISOString(),
        userId: 'admin-1'
      }
    ];
  }

  async createExpense(data: any) {
    // Mock expense creation - replace with Prisma when DB is ready
    return {
      success: true,
      expense: { id: `EXP-${Date.now()}`, ...data },
      message: 'هزینه ثبت شد'
    };
  }

  async getProfitLossReport(startDate: string, endDate: string) {
    // Mock P&L report - replace with Prisma when DB is ready
    return {
      period: { startDate, endDate },
      revenues: [
        { account: 'درآمد فروش بلیط', amount: 850000000 },
        { account: 'درآمد کمیسیون', amount: 45000000 }
      ],
      expenses: [
        { account: 'هزینه‌های عملیاتی', amount: 120000000 },
        { account: 'هزینه‌های اداری', amount: 80000000 }
      ],
      totalRevenue: 895000000,
      totalExpenses: 200000000,
      netIncome: 695000000
    };
  }

  async getBalanceSheetReport(asOfDate: string) {
    // Mock balance sheet - replace with Prisma when DB is ready
    return {
      asOfDate,
      assets: {
        current: [
          { account: 'نقد و معادل نقد', amount: 500000000 },
          { account: 'حساب‌های دریافتنی', amount: 150000000 }
        ],
        nonCurrent: [
          { account: 'تجهیزات دفتری', amount: 80000000 }
        ],
        totalAssets: 730000000
      },
      liabilities: {
        current: [
          { account: 'حساب‌های پرداختنی', amount: 45000000 }
        ],
        nonCurrent: [],
        totalLiabilities: 45000000
      },
      equity: {
        items: [
          { account: 'سرمایه', amount: 500000000 },
          { account: 'سود انباشته', amount: 185000000 }
        ],
        totalEquity: 685000000
      }
    };
  }

  async getTrialBalanceReport(asOfDate: string) {
    // Mock trial balance - replace with Prisma when DB is ready
    return {
      asOfDate,
      accounts: [
        { id: '1010', name: 'نقد و معادل نقد', debit: 500000000, credit: 0 },
        { id: '1020', name: 'حساب‌های دریافتنی', debit: 150000000, credit: 0 },
        { id: '2010', name: 'حساب‌های پرداختنی', debit: 0, credit: 45000000 },
        { id: '4011', name: 'درآمد فروش بلیط', debit: 0, credit: 850000000 }
      ],
      totalDebits: 650000000,
      totalCredits: 895000000
    };
  }
  async getAccountLedger(accountId: string, startDate?: string, endDate?: string) {
    // Mock account ledger - replace with Prisma when DB is ready
    return {
      account: { id: accountId, name: 'حساب‌های دریافتنی' },
      period: { startDate, endDate },
      transactions: [
        {
          id: 'JE-001',
          date: new Date().toISOString(),
          description: 'رزرو پرواز IR-452',
          debit: 11000000,
          credit: 0,
          balance: 11000000
        }
      ],
      openingBalance: 0,
      closingBalance: 11000000
    };
  }
}
