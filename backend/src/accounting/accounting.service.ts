import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingSetupService } from './accounting-setup.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(
    private prisma: PrismaService,
    private accountingSetup: AccountingSetupService
  ) {}

  async getOverview() {
    const accounts = await this.prisma.account.findMany();
    const journalEntries = await this.prisma.journalEntry.findMany({
      include: {
        transactions: {
          include: {
            account: true
          }
        }
      }
    });

    return {
      totalAccounts: accounts.length,
      totalJournalEntries: journalEntries.length,
      accountsByType: accounts.reduce((acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getChartOfAccounts() {
    return this.prisma.account.findMany({
      orderBy: [
        { code: 'asc' }
      ]
    });
  }

  async createAccount(data: any) {
    return this.prisma.account.create({
      data: {
        id: data.id || undefined,
        name: data.name,
        code: data.code,
        type: data.type as AccountType,
        parentId: data.parentId || null,
        isParent: data.isParent || false,
        balance: data.balance || 0,
        currency: data.currency || 'IRR'
      }
    });
  }

  async updateAccount(accountId: string, data: any) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        name: data.name,
        code: data.code,
        type: data.type as AccountType,
        parentId: data.parentId || null,
        isParent: data.isParent || false,
        balance: data.balance || 0,
        currency: data.currency || 'IRR'
      }
    });
  }

  async getJournalEntries(startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    return this.prisma.journalEntry.findMany({
      where,
      include: {
        transactions: {
          include: {
            account: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async createJournalEntry(data: any) {
    return this.prisma.journalEntry.create({
      data: {
        description: data.description,
        date: new Date(data.date),
        userId: data.userId,
        transactions: {
          create: data.transactions.map((t: any) => ({
            accountId: t.accountId,
            debit: t.debit,
            credit: t.credit
          }))
        }
      },
      include: {
        transactions: {
          include: {
            account: true
          }
        }
      }
    });
  }

  async getExpenses(startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        account: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async createExpense(data: any) {
    return this.prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        accountId: data.accountId,
        userId: data.userId
      },
      include: {
        account: true
      }
    });
  }

  async getProfitLossReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const revenue = await this.prisma.transaction.aggregate({
      where: {
        credit: { gt: 0 },
        journalEntry: {
          date: { gte: start, lte: end }
        },
        account: {
          type: 'REVENUE'
        }
      },
      _sum: { credit: true }
    });

    const expenses = await this.prisma.transaction.aggregate({
      where: {
        debit: { gt: 0 },
        journalEntry: {
          date: { gte: start, lte: end }
        },
        account: {
          type: 'EXPENSE'
        }
      },
      _sum: { debit: true }
    });

    const totalRevenue = revenue._sum.credit || 0;
    const totalExpenses = expenses._sum.debit || 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      period: { startDate, endDate },
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    };
  }

  async getBalanceSheetReport(asOfDate: string) {
    const asOf = new Date(asOfDate);

    const assets = await this.prisma.account.findMany({
      where: {
        type: 'ASSET',
        transactions: {
          some: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      },
      include: {
        transactions: {
          where: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      }
    });

    const liabilities = await this.prisma.account.findMany({
      where: {
        type: 'LIABILITY',
        transactions: {
          some: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      },
      include: {
        transactions: {
          where: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      }
    });

    const equity = await this.prisma.account.findMany({
      where: {
        type: 'EQUITY',
        transactions: {
          some: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      },
      include: {
        transactions: {
          where: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      }
    });

    const totalAssets = assets.reduce((sum, account) => sum + account.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, account) => sum + account.balance, 0);
    const totalEquity = equity.reduce((sum, account) => sum + account.balance, 0);

    return {
      asOfDate,
      assets: {
        accounts: assets,
        total: totalAssets
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities
      },
      equity: {
        accounts: equity,
        total: totalEquity
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: totalAssets === (totalLiabilities + totalEquity)
    };
  }

  async getTrialBalanceReport(asOfDate: string) {
    const asOf = new Date(asOfDate);

    const accounts = await this.prisma.account.findMany({
      include: {
        transactions: {
          where: {
            journalEntry: {
              date: { lte: asOf }
            }
          }
        }
      }
    });

    const trialBalance = accounts.map(account => {
      const totalDebits = account.transactions.reduce((sum, t) => sum + t.debit, 0);
      const totalCredits = account.transactions.reduce((sum, t) => sum + t.credit, 0);
      const balance = totalDebits - totalCredits;

      return {
        accountId: account.id,
        accountName: account.name,
        accountCode: account.code,
        accountType: account.type,
        totalDebits,
        totalCredits,
        balance: balance > 0 ? balance : 0,
        creditBalance: balance < 0 ? Math.abs(balance) : 0
      };
    });

    const totalDebits = trialBalance.reduce((sum, item) => sum + item.totalDebits, 0);
    const totalCredits = trialBalance.reduce((sum, item) => sum + item.totalCredits, 0);

    return {
      asOfDate,
      accounts: trialBalance,
      totalDebits,
      totalCredits,
      isBalanced: totalDebits === totalCredits
    };
  }

  async getAccountLedger(accountId: string, startDate?: string, endDate?: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const where: any = { accountId };
    
    if (startDate && endDate) {
      where.journalEntry = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        journalEntry: true
      },
      orderBy: {
        journalEntry: {
          date: 'asc'
        }
      }
    });

    let runningBalance = 0;
    const ledgerEntries = transactions.map(t => {
      runningBalance += t.debit - t.credit;
      return {
        id: t.id,
        date: t.journalEntry.date,
        description: t.journalEntry.description,
        debit: t.debit,
        credit: t.credit,
        balance: runningBalance
      };
    });

    return {
      account,
      period: { startDate, endDate },
      transactions: ledgerEntries,
      openingBalance: 0,
      closingBalance: runningBalance
    };
  }

  async createWalletChargeEntry(userId: string, amount: number, description: string) {
    try {
      console.log(`💰 Creating wallet charge accounting entry for user ${userId}, amount: ${amount}`);
      
      const journalEntry = await this.prisma.journalEntry.create({
        data: {
          description: `شارژ کیف پول - ${description}`,
          userId,
          date: new Date(),
          transactions: {
            create: [
              { accountId: '1010', debit: amount, credit: 0 }, // Debit: Cash/Bank Account
              { accountId: '2010', debit: 0, credit: amount }, // Credit: Customer Liability
            ],
          },
        },
        include: { transactions: { include: { account: true } } },
      });

      await this.updateAccountBalance('1010', amount, 0); // Debit
      await this.updateAccountBalance('2010', 0, amount); // Credit

      console.log(`✅ Wallet charge accounting entry created: ${journalEntry.id}`);
      return { success: true, journalEntry, message: 'سند حسابداری شارژ کیف پول ایجاد شد' };
    } catch (error) {
      console.error('❌ Error creating wallet charge accounting entry:', error);
      return { success: false, message: 'خطا در ایجاد سند حسابداری شارژ کیف پول' };
    }
  }

  async createBookingEntry(bookingId: string, userId: string, totalAmount: number, flightCost: number) {
    try {
      console.log(`🎫 Creating booking accounting entry for booking ${bookingId}, amount: ${totalAmount}`);
      
      const profit = totalAmount - flightCost;
      
      const journalEntry = await this.prisma.journalEntry.create({
        data: {
          description: `رزرو بلیط - Booking ${bookingId}`,
          userId,
          bookingId,
          date: new Date(),
          transactions: {
            create: [
              { accountId: '2010', debit: totalAmount, credit: 0 }, // Debit: Customer Liability (customer pays us)
              { accountId: '4010', debit: 0, credit: totalAmount }, // Credit: Ticket Sales Revenue
              { accountId: '5010', debit: flightCost, credit: 0 }, // Debit: Ticket Purchase Cost
              { accountId: '1010', debit: 0, credit: totalAmount }, // Credit: Cash/Bank Account (money leaves for cost)
            ],
          },
        },
        include: { transactions: { include: { account: true } } },
      });

      await this.updateAccountBalance('2010', totalAmount, 0); // Debit
      await this.updateAccountBalance('4010', 0, totalAmount); // Credit
      await this.updateAccountBalance('5010', flightCost, 0); // Debit
      await this.updateAccountBalance('1010', 0, totalAmount); // Credit

      console.log(`✅ Booking accounting entry created: ${journalEntry.id}`);
      console.log(`   - Revenue: ${totalAmount} IRR`);
      console.log(`   - Cost: ${flightCost} IRR`);
      console.log(`   - Profit: ${profit} IRR`);
      
      return { success: true, journalEntry, message: 'سند حسابداری رزرو بلیط ایجاد شد', profit };
    } catch (error) {
      console.error('❌ Error creating booking accounting entry:', error);
      return { success: false, message: 'خطا در ایجاد سند حسابداری رزرو بلیط' };
    }
  }

  private async updateAccountBalance(accountId: string, debit: number, credit: number) {
    const netChange = credit - debit;
    await this.prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: netChange } }
    });
  }
}