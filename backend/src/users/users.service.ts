import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedPassengers: true,
        wallet: {
          include: {
            walletTransactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid current password');
      }

      // Add new password validation rules
      if (data.newPassword.length < 8) {
        throw new BadRequestException('New password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(data.newPassword)) {
        throw new BadRequestException('New password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(data.newPassword)) {
        throw new BadRequestException('New password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(data.newPassword)) {
        throw new BadRequestException('New password must contain at least one number');
      }
      if (!/[^A-Za-z0-9]/.test(data.newPassword)) {
        throw new BadRequestException('New password must contain at least one special character');
      }

      data.newPassword = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        passwordHash: data.newPassword, // Use passwordHash field
      },
      select: { id: true, name: true, username: true, email: true, phone: true, role: true, status: true, createdAt: true, displayCurrencies: true, savedPassengers: true, tenantId: true, canBypassRateLimit: true, }, // Return updated user without sensitive data
    });

    return { success: true, message: 'Profile updated successfully', user: updatedUser };
  }

  async getWallet(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
    });

    // Get all transactions for this user
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (!wallets || wallets.length === 0) {
      // If no wallet exists, return a default empty wallet structure
      return {};
    }

    // Restructure to match the frontend expected format: { [currency]: { balance, currency, transactions } }
    const walletData: any = {};
    
    for (const wallet of wallets) {
      // Filter transactions for this specific currency
      const currencyTransactions = transactions.filter(tx => tx.currency === wallet.currency);
      
      walletData[wallet.currency] = {
        balance: wallet.balance, // balance is already a number in Prisma schema
        currency: wallet.currency,
        transactions: currencyTransactions.map(tx => ({
          id: tx.id,
          date: tx.date.toISOString(),
          type: tx.type,
          amount: tx.amount, // amount is already a number in Prisma schema
          currency: tx.currency,
          description: tx.description,
          relatedBookingId: tx.relatedBookingId,
          relatedUserId: tx.relatedUserId,
        })),
      };
    }
    return walletData;
  }

  async getSavedPassengers(userId: string) {
    return this.prisma.savedPassenger.findMany({ where: { userId } });
  }

  async addSavedPassenger(userId: string, data: any) {
    const newPassenger = await this.prisma.savedPassenger.create({
      data: {
        ...data,
        userId,
      },
    });
    return { success: true, passenger: newPassenger };
  }

  async updateSavedPassenger(userId: string, passengerId: string, data: any) {
    const existingPassenger = await this.prisma.savedPassenger.findUnique({
      where: { id: passengerId },
    });

    if (!existingPassenger || existingPassenger.userId !== userId) {
      throw new NotFoundException('مسافر ذخیره شده یافت نشد');
    }

    await this.prisma.savedPassenger.update({
      where: { id: passengerId },
      data,
    });

    return { success: true, message: 'مسافر با موفقیت به‌روزرسانی شد' };
  }

  async deleteSavedPassenger(userId: string, passengerId: string) {
    const existingPassenger = await this.prisma.savedPassenger.findUnique({
      where: { id: passengerId },
    });

    if (!existingPassenger || existingPassenger.userId !== userId) {
      throw new NotFoundException('مسافر ذخیره شده یافت نشد');
    }

    await this.prisma.savedPassenger.delete({
      where: { id: passengerId },
    });

    return { success: true, message: 'مسافر با موفقیت حذف شد' };
  }

  async getAffiliateStats(userId: string) {
    const totalBookings = await this.prisma.booking.count({
      where: { userId, status: 'CONFIRMED' },
    });

    const totalFlights = await this.prisma.flight.count({
      where: { creatorId: userId },
    });

    // Calculate total earnings from commissions (assuming commission is stored on booking or a separate commission model)
    const totalEarningsResult = await this.prisma.booking.aggregate({
      _sum: { totalPrice: true }, // Assuming commission is a percentage of totalPrice, or you'd have a separate field
      where: { userId, status: 'CONFIRMED' },
    });
    const totalEarnings = totalEarningsResult._sum.totalPrice ? Number(totalEarningsResult._sum.totalPrice) * 0.05 : 0; // Mocking 5% commission

    // Monthly earnings (simplified for now)
    const monthlyEarnings = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthlyRevenue = await this.prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          userId,
          status: 'CONFIRMED',
          bookingDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      monthlyEarnings.push({
        month: startOfMonth.toLocaleString('fa-IR', { month: 'long' }),
        earnings: monthlyRevenue._sum.totalPrice ? Number(monthlyRevenue._sum.totalPrice) * 0.05 : 0,
      });
    }

    // Top routes (simplified for now)
    const topRoutes = await this.prisma.booking.groupBy({
      by: ['flightId'],
      where: { userId, status: 'CONFIRMED' },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { id: 'desc' } },
      take: 2,
    });

    const populatedTopRoutes = await Promise.all(topRoutes.map(async (route) => {
      const flight = await this.prisma.flight.findUnique({
        where: { id: route.flightId },
        select: {
          departureAirport: { select: { city: true } },
          arrivalAirport: { select: { city: true } },
        },
      });
      return {
        route: `${(flight?.departureAirport as any)?.city?.fa || ''} - ${(flight?.arrivalAirport as any)?.city?.fa || ''}`,
        bookings: route._count.id,
        earnings: Number(route._sum.totalPrice || 0) * 0.05,
      };
    }));

    return {
      totalEarnings,
      totalBookings,
      totalFlights,
      conversionRate: totalBookings && totalFlights ? (totalBookings / totalFlights) * 100 : 0,
      monthlyEarnings,
      topRoutes: populatedTopRoutes,
    };
  }

  async getAffiliateFlights(userId: string) {
    return this.prisma.flight.findMany({
      where: { creatorId: userId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        flightClassInfo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAffiliateBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        flight: {
          select: {
            flightNumber: true,
            departureAirport: { select: { city: true } },
            arrivalAirport: { select: { city: true } },
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async getAffiliateAccounting(userId: string) {
    const userBookings = await this.prisma.booking.findMany({
      where: { userId, status: 'CONFIRMED' },
      include: {
        flight: { include: { commissionModel: true } },
      },
    });

    let totalEarnings = 0;
    let pendingCommissions = 0;

    for (const booking of userBookings) {
      if (booking.flight.commissionModel) {
        const commissionRate = booking.flight.commissionModel.charterCommission; // Assuming charter commission for affiliate
        const bookingCommission = Number(booking.totalPrice) * (commissionRate / 100);

        totalEarnings += bookingCommission;

        // Check if this booking's commission has been paid out
        const paidTransaction = await this.prisma.walletTransaction.findFirst({
          where: {
            userId,
            type: 'COMMISSION_PAYOUT',
            relatedBookingId: booking.id,
          },
        });

        if (!paidTransaction) {
          pendingCommissions += bookingCommission;
        }
      }
    }

    const paidCommissionsTransactions = await this.prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: 'COMMISSION_PAYOUT',
      },
    });
    const paidCommissions = paidCommissionsTransactions._sum.amount ? Number(paidCommissionsTransactions._sum.amount) : 0;

    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
        userId,
        OR: [
          { type: 'COMMISSION_PAYOUT' },
          { type: 'DEPOSIT' }, // Assuming deposits might be related to earnings
          { type: 'WITHDRAWAL' }, // Assuming withdrawals might be related to earnings
        ],
      },
      orderBy: { date: 'desc' },
    });

    // For simplicity, using a fixed commission rate for display, or get from a prominent model
    const commissionRate = userBookings.length > 0 && userBookings[0].flight.commissionModel
      ? userBookings[0].flight.commissionModel.charterCommission
      : 0;

    return {
      totalEarnings,
      pendingCommissions,
      paidCommissions,
      commissionRate,
      transactions: transactions.map(tx => ({
        id: tx.id,
        date: tx.date.toISOString(),
        type: tx.type,
        amount: Number(tx.amount),
        description: tx.description,
        bookingId: tx.relatedBookingId,
      })),
    };
  }
}
