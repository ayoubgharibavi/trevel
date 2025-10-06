import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's financial summary including wallet balance and transaction history
   */
  async getUserFinancialSummary(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId_currency: {
          userId,
          currency: 'IRR'
        }
      }
    });

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10
    });

    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      },
      orderBy: { bookingDate: 'desc' },
      take: 10
    });

    const totalSpent = await this.prisma.walletTransaction.aggregate({
      where: {
        userId,
        type: 'BOOKING_PAYMENT'
      },
      _sum: {
        amount: true
      }
    });

    return {
      wallet: {
        balance: wallet ? Number(wallet.balance) : 0,
        currency: 'IRR'
      },
      summary: {
        totalSpent: Number(totalSpent._sum.amount || 0),
        totalBookings: bookings.length,
        lastTransaction: transactions[0] || null
      },
      recentTransactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        bookingId: t.relatedBookingId
      })),
      recentBookings: bookings.map(b => ({
        id: b.id,
        date: b.bookingDate,
        amount: b.totalPrice,
        status: b.status,
        flight: {
          from: b.flight.departureAirport?.name || 'Unknown',
          to: b.flight.arrivalAirport?.name || 'Unknown',
          date: b.flight.departureTime
        }
      }))
    };
  }

  /**
   * Generate profit/loss report for admin
   */
  async getProfitLossReport(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Get all journal entries with transactions
    const journalEntries = await this.prisma.journalEntry.findMany({
      where: whereClause,
      include: {
        transactions: {
          include: {
            account: true
          }
        }
      }
    });

    // Calculate revenue (Credit to Ticket Sales Revenue account 4011)
    const revenueTransactions = journalEntries
      .flatMap(je => je.transactions)
      .filter(t => t.accountId === '4011');

    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.credit, 0);

    // Calculate cost of goods sold (Debit to COGS account 5011)
    const cogsTransactions = journalEntries
      .flatMap(je => je.transactions)
      .filter(t => t.accountId === '5011');

    const totalCOGS = cogsTransactions.reduce((sum, t) => sum + t.debit, 0);

    // Calculate gross profit
    const grossProfit = totalRevenue - totalCOGS;

    // Get booking statistics
    const bookingStats = await this.prisma.booking.aggregate({
      where: {
        bookingDate: startDate && endDate ? {
          gte: startDate,
          lte: endDate
        } : undefined
      },
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      }
    });

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      revenue: {
        total: totalRevenue,
        currency: 'IRR',
        transactions: revenueTransactions.length
      },
      costs: {
        total: totalCOGS,
        currency: 'IRR',
        transactions: cogsTransactions.length
      },
      profit: {
        gross: grossProfit,
        margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        currency: 'IRR'
      },
      bookings: {
        total: bookingStats._count?.id || 0,
        totalRevenue: bookingStats._sum?.totalPrice || 0
      }
    };
  }

  /**
   * Generate invoice for a specific booking
   */
  async generateInvoice(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true
          }
        },
        user: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get accounting details for this booking
    const journalEntry = await this.prisma.journalEntry.findFirst({
      where: { bookingId },
      include: {
        transactions: {
          include: {
            account: true
          }
        }
      }
    });

    const invoiceNumber = `INV-${bookingId.slice(-8).toUpperCase()}`;
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return {
      invoice: {
        number: invoiceNumber,
        issueDate,
        dueDate,
        status: 'PAID'
      },
      customer: {
        name: booking.user.name,
        email: booking.user.email,
        id: booking.user.id
      },
      booking: {
        id: booking.id,
        date: booking.bookingDate,
        status: booking.status
      },
      flight: {
        airline: booking.flight.airlineInfo?.name || booking.flight.airline,
        flightNumber: booking.flight.flightNumber,
        from: booking.flight.departureAirport?.name || 'Unknown',
        to: booking.flight.arrivalAirport?.name || 'Unknown',
        departureDate: booking.flight.departureTime,
        arrivalDate: booking.flight.arrivalTime
      },
      financial: {
        subtotal: booking.totalPrice,
        tax: 0, // Assuming no tax for now
        total: booking.totalPrice,
        currency: 'IRR'
      },
      accounting: journalEntry ? {
        journalEntryId: journalEntry.id,
        transactions: journalEntry.transactions.map(t => ({
          account: t.account.name,
          accountCode: t.account.code,
          debit: t.debit,
          credit: t.credit
        }))
      } : null
    };
  }

  /**
   * Get travel expense report for a user
   */
  async getUserTravelExpenses(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { userId };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where: whereClause,
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      },
      orderBy: { bookingDate: 'desc' }
    });

    const totalExpenses = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return {
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      summary: {
        totalExpenses,
        totalTrips: bookings.length,
        averagePerTrip: bookings.length > 0 ? totalExpenses / bookings.length : 0,
        currency: 'IRR'
      },
      trips: bookings.map(b => ({
        id: b.id,
        date: b.bookingDate,
        amount: b.totalPrice,
        status: b.status,
        route: `${b.flight.departureAirport?.name || 'Unknown'} → ${b.flight.arrivalAirport?.name || 'Unknown'}`,
        departureDate: b.flight.departureTime
      }))
    };
  }
}








