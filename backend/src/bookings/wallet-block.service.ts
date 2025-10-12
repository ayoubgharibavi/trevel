import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WalletBlockRequest {
  userId: string;
  amount: number; // in Rials
  reason: string;
  flightId?: string;
  description?: string;
}

export interface WalletBlockResponse {
  success: boolean;
  transactionId: string;
  blockedAmount: number;
  remainingBalance: number;
  message?: string;
}

export interface WalletUnblockRequest {
  transactionId: string;
  reason: string;
}

export interface WalletUnblockResponse {
  success: boolean;
  unblockedAmount: number;
  remainingBalance: number;
  message?: string;
}

@Injectable()
export class WalletBlockService {
  private readonly logger = new Logger(WalletBlockService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * بلوکه کردن پول در کیف پول کاربر
   */
  async blockFunds(request: WalletBlockRequest): Promise<WalletBlockResponse> {
    this.logger.log(`🔒 Blocking ${request.amount} Rials for user ${request.userId}`);

    try {
      // Start transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Get user wallet
        const wallet = await tx.wallet.findFirst({
          where: { 
            userId: request.userId,
            currency: 'IRR'
          }
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        // Calculate available balance (total - blocked)
        const blockedTransactions = await tx.walletTransaction.findMany({
          where: {
            userId: request.userId,
            type: 'BLOCK',
            status: 'PENDING'
          }
        });

        const blockedAmount = blockedTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const availableBalance = Number(wallet.balance) - blockedAmount;

        if (availableBalance < request.amount) {
          throw new Error('Insufficient balance');
        }

        // Create block transaction
        const blockTransaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            userId: request.userId,
            type: 'BLOCK',
            amount: BigInt(request.amount),
            currency: 'IRR',
            description: request.description || request.reason,
            status: 'PENDING',
            metadata: JSON.stringify({
              reason: request.reason,
              flightId: request.flightId,
              blockedAt: new Date().toISOString()
            })
          }
        });

        // Update wallet blocked amount
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            blockedAmount: BigInt(blockedAmount + request.amount),
            updatedAt: new Date()
          }
        });

        return {
          transactionId: blockTransaction.id,
          blockedAmount: request.amount,
          remainingBalance: availableBalance - request.amount
        };
      });

      this.logger.log(`✅ Successfully blocked ${request.amount} Rials. Transaction ID: ${result.transactionId}`);

      return {
        success: true,
        transactionId: result.transactionId,
        blockedAmount: result.blockedAmount,
        remainingBalance: result.remainingBalance,
        message: 'Funds blocked successfully'
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to block funds: ${error.message}`);
      throw new Error(`Failed to block funds: ${error.message}`);
    }
  }

  /**
   * آزاد کردن پول بلوکه شده
   */
  async unblockFunds(request: WalletUnblockRequest): Promise<WalletUnblockResponse> {
    this.logger.log(`🔓 Unblocking transaction ${request.transactionId}`);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Get the block transaction
        const blockTransaction = await tx.walletTransaction.findUnique({
          where: { id: request.transactionId },
          include: { wallet: true }
        });

        if (!blockTransaction) {
          throw new Error('Transaction not found');
        }

        if (blockTransaction.type !== 'BLOCK' || blockTransaction.status !== 'PENDING') {
          throw new Error('Invalid transaction for unblocking');
        }

        // Create unblock transaction
        const unblockTransaction = await tx.walletTransaction.create({
          data: {
            walletId: blockTransaction.walletId,
            userId: blockTransaction.userId,
            type: 'UNBLOCK',
            amount: blockTransaction.amount,
            currency: blockTransaction.currency,
            description: `Unblock: ${request.reason}`,
            status: 'COMPLETED',
            metadata: JSON.stringify({
              originalTransactionId: request.transactionId,
              reason: request.reason,
              unblockedAt: new Date().toISOString()
            })
          }
        });

        // Update original transaction status
        await tx.walletTransaction.update({
          where: { id: request.transactionId },
          data: {
            status: 'CANCELLED',
            metadata: JSON.stringify({
              ...JSON.parse(blockTransaction.metadata || '{}'),
              unblockedAt: new Date().toISOString(),
              unblockReason: request.reason
            })
          }
        });

        // Update wallet blocked amount
        const wallet = blockTransaction.wallet;
        const currentBlockedAmount = await tx.walletTransaction.aggregate({
          where: {
            walletId: wallet.id,
            type: 'BLOCK',
            status: 'PENDING'
          },
          _sum: { amount: true }
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            blockedAmount: BigInt(currentBlockedAmount._sum.amount || 0),
            updatedAt: new Date()
          }
        });

        return {
          unblockedAmount: Number(blockTransaction.amount),
          remainingBalance: Number(wallet.balance) - Number(currentBlockedAmount._sum.amount || 0)
        };
      });

      this.logger.log(`✅ Successfully unblocked ${result.unblockedAmount} Rials`);

      return {
        success: true,
        unblockedAmount: result.unblockedAmount,
        remainingBalance: result.remainingBalance,
        message: 'Funds unblocked successfully'
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to unblock funds: ${error.message}`);
      throw new Error(`Failed to unblock funds: ${error.message}`);
    }
  }

  /**
   * تأیید پرداخت و انتقال پول از بلوکه شده به پرداخت شده
   */
  async confirmPayment(transactionId: string, bookingId: string): Promise<WalletBlockResponse> {
    this.logger.log(`💰 Confirming payment for transaction ${transactionId}`);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Get the block transaction
        const blockTransaction = await tx.walletTransaction.findUnique({
          where: { id: transactionId },
          include: { wallet: true }
        });

        if (!blockTransaction) {
          throw new Error('Transaction not found');
        }

        if (blockTransaction.type !== 'BLOCK' || blockTransaction.status !== 'PENDING') {
          throw new Error('Invalid transaction for payment confirmation');
        }

        // Create payment transaction
        const paymentTransaction = await tx.walletTransaction.create({
          data: {
            walletId: blockTransaction.walletId,
            userId: blockTransaction.userId,
            type: 'PAYMENT',
            amount: blockTransaction.amount,
            currency: blockTransaction.currency,
            description: `Payment for booking ${bookingId}`,
            status: 'COMPLETED',
            metadata: JSON.stringify({
              bookingId: bookingId,
              originalTransactionId: transactionId,
              paidAt: new Date().toISOString()
            })
          }
        });

        // Update original transaction status
        await tx.walletTransaction.update({
          where: { id: transactionId },
          data: {
            status: 'COMPLETED',
            metadata: JSON.stringify({
              ...JSON.parse(blockTransaction.metadata || '{}'),
              confirmedAt: new Date().toISOString(),
              paymentTransactionId: paymentTransaction.id
            })
          }
        });

        // Update wallet balance and blocked amount
        const wallet = blockTransaction.wallet;
        const currentBlockedAmount = await tx.walletTransaction.aggregate({
          where: {
            walletId: wallet.id,
            type: 'BLOCK',
            status: 'PENDING'
          },
          _sum: { amount: true }
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: BigInt(Number(wallet.balance) - Number(blockTransaction.amount)),
            blockedAmount: BigInt(currentBlockedAmount._sum.amount || 0),
            updatedAt: new Date()
          }
        });

        return {
          transactionId: paymentTransaction.id,
          blockedAmount: 0,
          remainingBalance: Number(wallet.balance) - Number(blockTransaction.amount)
        };
      });

      this.logger.log(`✅ Payment confirmed. Transaction ID: ${result.transactionId}`);

      return {
        success: true,
        transactionId: result.transactionId,
        blockedAmount: result.blockedAmount,
        remainingBalance: result.remainingBalance,
        message: 'Payment confirmed successfully'
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to confirm payment: ${error.message}`);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * دریافت موجودی کیف پول کاربر
   */
  async getWalletBalance(userId: string): Promise<{
    balance: number;
    blockedAmount: number;
    availableBalance: number;
  }> {
    try {
      const wallet = await this.prisma.wallet.findFirst({
        where: { 
          userId,
          currency: 'IRR'
        },
        include: { transactions: true }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const blockedAmount = wallet.transactions
        .filter((t: any) => t.type === 'BLOCK' && t.status === 'PENDING')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const availableBalance = Number(wallet.balance) - blockedAmount;

      return {
        balance: Number(wallet.balance),
        blockedAmount: blockedAmount,
        availableBalance: availableBalance
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to get wallet balance: ${error.message}`);
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  /**
   * دریافت تاریخچه تراکنش‌های کیف پول
   */
  async getWalletTransactions(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const wallet = await this.prisma.wallet.findFirst({
        where: { 
          userId,
          currency: 'IRR'
        },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: limit
          }
        }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return wallet.transactions.map((transaction: any) => ({
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.date,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
      }));

    } catch (error: any) {
      this.logger.error(`❌ Failed to get wallet transactions: ${error.message}`);
      throw new Error(`Failed to get wallet transactions: ${error.message}`);
    }
  }
}