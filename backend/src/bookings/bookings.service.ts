import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from '../common/dto';
import { BookingStatus, FlightStatus } from '@prisma/client';
import { WalletBlockService } from './wallet-block.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletBlockService: WalletBlockService
  ) {}

  async createBooking(createBookingDto: CreateBookingDto, userId: string) {
    const { flightId, passengers, totalPrice, contactEmail, contactPhone, sepehrBookingId, sepehrPnr, charter118BookingId, charter118ConfirmationCode, purchasePrice, flightData } = createBookingDto;
    
    // Use purchasePrice if totalPrice is not provided
    const finalTotalPrice = totalPrice || purchasePrice;

    console.log('🔍 DEBUG - createBookingDto:', createBookingDto);
    console.log('🔍 DEBUG - flightId:', flightId);
    console.log('🔍 DEBUG - passengers:', passengers);
    console.log('🔍 DEBUG - totalPrice:', totalPrice);
    console.log('🔍 DEBUG - purchasePrice:', purchasePrice);
    console.log('🔍 DEBUG - finalTotalPrice:', finalTotalPrice);
    console.log('🔍 DEBUG - sepehrBookingId:', sepehrBookingId);
    console.log('🔍 DEBUG - sepehrPnr:', sepehrPnr);
    console.log('🔍 DEBUG - charter118BookingId:', charter118BookingId);
    console.log('🔍 DEBUG - charter118ConfirmationCode:', charter118ConfirmationCode);
    console.log('🔍 DEBUG - flightData:', flightData);

    if (!flightId) {
      throw new Error('flightId is required');
    }

    // For external API bookings (Sepehr, Charter118), create flight if it doesn't exist
    let flight = null;
    if (sepehrBookingId || charter118BookingId) {
      console.log('🔍 DEBUG - Creating/upserting external flight...');
      
      // Use actual flight data if provided, otherwise use defaults
      const flightInfo = flightData || {};
      
      // For external API bookings, create/upsert the flight
      flight = await this.prisma.flight.upsert({
        where: { id: flightId },
        update: {},
        create: {
          id: flightId,
          flightNumber: flightInfo.flightNumber || (flightId.startsWith('sepehr-') ? 'SP001' : 'C118-001'),
          airline: flightInfo.airline || (flightId.startsWith('sepehr-') ? 'سپهر' : 'Charter118'),
          aircraft: flightInfo.aircraft || 'Boeing 737',
          flightClass: flightInfo.class || 'اقتصادی',
          duration: flightInfo.duration || 180, // 3 hours
          price: BigInt(finalTotalPrice || 0),
          taxes: BigInt(flightInfo.taxes || 0),
          availableSeats: flightInfo.availableSeats || 100,
          totalCapacity: flightInfo.totalCapacity || 150,
          airlineId: undefined,
          aircraftId: undefined,
          flightClassId: undefined,
          departureAirportId: 'airport-1', // IKA - should be mapped from flightData
          arrivalAirportId: 'airport-4', // DXB - should be mapped from flightData
          departureTime: flightInfo.departure?.dateTime ? new Date(flightInfo.departure.dateTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          arrivalTime: flightInfo.arrival?.dateTime ? new Date(flightInfo.arrival.dateTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          status: FlightStatus.ON_TIME,
          source: sepehrBookingId ? 'sepehr' : 'charter118',
          // Additional Sepehr-specific fields
          ...(sepehrBookingId && {
            sourcingType: flightInfo.sourcingType || 'System',
            bookingCode: flightInfo.bookingCode,
            fareName: flightInfo.fareName,
            cancellationPolicy: flightInfo.cancellationPolicy,
            baggageAllowance: flightInfo.baggageAllowance,
            stops: flightInfo.stops || 0
          })
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airlineInfo: true,
          flightClassInfo: true,
          aircraftInfo: true,
        },
      });
      console.log('✅ DEBUG - External flight created/upserted:', flight.id);
    } else {
      console.log('🔍 DEBUG - Finding local flight...');
      // Check if flight exists (only for local flights)
      flight = await this.prisma.flight.findUnique({
        where: { id: flightId },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airlineInfo: true,
          flightClassInfo: true,
          aircraftInfo: true,
        },
      });

      if (!flight) {
        throw new NotFoundException('Flight not found');
      }
      console.log('✅ DEBUG - Local flight found:', flight.id);
    }

    // Create booking first
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        flightId,
        totalPrice: Number(finalTotalPrice),
        status: BookingStatus.CONFIRMED, // All bookings are confirmed by default
        source: sepehrBookingId ? 'sepehr' : charter118BookingId ? 'charter118' : 'manual',
        contactEmail: contactEmail || 'user@example.com',
        contactPhone: contactPhone || '+989000000000',
        tenantId: 'tenant-1',
        passengersData: JSON.stringify(passengers),
        searchQuery: '',
        notes: sepehrBookingId ? `Sepehr Booking ID: ${sepehrBookingId}, PNR: ${sepehrPnr}` : 
               charter118BookingId ? `Charter118 Booking ID: ${charter118BookingId}, Confirmation Code: ${charter118ConfirmationCode}` : '',
      },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Block funds for booking using WalletBlockService
    console.log('🔍 DEBUG - Blocking funds for booking...');
    const walletBlock = await this.walletBlockService.blockFunds({
      userId,
      amount: finalTotalPrice || 0,
      reason: `Flight booking - ${flightId}`,
      bookingId: booking.id,
      flightId: flightId
    });
    console.log('✅ DEBUG - Funds blocked successfully');

    // Create accounting entries (only for local flights)
    if (!sepehrBookingId && !charter118BookingId) {
      await this.createAccountingEntries(booking.id, finalTotalPrice || 0, userId);
    }

    return {
      booking,
      walletBlock
    };
  }

  async createManualBooking(createBookingDto: CreateBookingDto, userId: string) {
    const { flightId, passengers, totalPrice } = createBookingDto;

    // Check if flight exists
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        flightClassInfo: true,
        aircraftInfo: true,
      },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        flightId,
        totalPrice,
        status: BookingStatus.CONFIRMED,
        passengersInfo: passengers as any,
        source: 'manual',
        contactEmail: '',
        contactPhone: '',
        tenantId: 'tenant-1',
        passengersData: passengers as any,
        searchQuery: '',
      },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Create accounting entries
    await this.createAccountingEntries(booking.id, totalPrice, userId);

    return booking;
  }

  /**
   * Get all suspended bookings for admin panel
   */
  async getSuspendedBookings() {
    return await this.prisma.booking.findMany({
      where: { status: 'SUSPENDED' },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true
          }
        },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Confirm suspended booking and deduct payment
   */
  async confirmSuspendedBooking(bookingId: string, adminId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { walletBlocks: true }
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== 'SUSPENDED') {
      throw new BadRequestException('Booking is not suspended');
    }

    // Confirm payment
    if (booking.walletTransactionId) {
      await this.walletBlockService.confirmPayment(booking.walletTransactionId, bookingId);
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    });

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking confirmed and payment deducted'
    };
  }

  /**
   * Reject suspended booking and release payment
   */
  async rejectSuspendedBooking(bookingId: string, adminId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { walletBlocks: true }
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== 'SUSPENDED') {
      throw new BadRequestException('Booking is not suspended');
    }

    // Release blocked funds
    if (booking.walletTransactionId) {
      await this.walletBlockService.unblockFunds({
        transactionId: booking.walletTransactionId,
        reason: reason || 'Booking rejected by admin'
      });
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'REJECTED',
        notes: reason || 'Rejected by admin'
      }
    });

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking rejected and funds released'
    };
  }

  async deductFromWallet(userId: string, amount: number, bookingId: string, description: string) {
    console.log('🔍 DEBUG - deductFromWallet called:', { userId, amount, bookingId, description });
    
    // Find user's wallet
    let wallet = await this.prisma.wallet.findFirst({
      where: { 
        userId,
        currency: 'IRR'
      }
    });

    if (!wallet) {
      console.log('🔍 DEBUG - Wallet not found, creating new wallet...');
      // Create wallet if it doesn't exist
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: BigInt(1000000), // Give user 1,000,000 IRR initial balance
          currency: 'IRR',
        },
      });
      console.log('✅ DEBUG - New wallet created with initial balance:', Number(wallet.balance));
    }

    // Check if user has sufficient balance
    const currentBalance = Number(wallet.balance);
    console.log('🔍 DEBUG - Current balance:', currentBalance, 'Required amount:', amount);
    
    if (currentBalance < amount) {
      // If insufficient balance, add more money to wallet (for testing purposes)
      const additionalAmount = amount - currentBalance + 100000; // Add extra 100,000 IRR
      const newBalance = currentBalance + additionalAmount;
      
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: BigInt(newBalance) }
      });
      
      // Create credit transaction for the additional amount
      await this.prisma.walletTransaction.create({
        data: {
          userId,
          amount: BigInt(additionalAmount),
          type: 'DEPOSIT',
          description: `Auto credit for insufficient balance - ${description}`,
          currency: 'IRR',
          relatedBookingId: bookingId,
        },
      });
      
      console.log('✅ DEBUG - Added additional balance:', additionalAmount, 'New balance:', newBalance);
    }

    // Deduct from wallet
    const finalBalance = Number(wallet.balance);
    const newBalance = finalBalance - amount;
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: BigInt(newBalance) }
    });

    // Create wallet transaction
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        amount: BigInt(amount),
        type: 'BOOKING_PAYMENT',
        description,
        currency: 'IRR',
        relatedBookingId: bookingId,
      },
    });

    console.log('✅ DEBUG - Wallet deduction successful:', { newBalance, amount });
    return { success: true, newBalance, amount };
  }
  async getUserBookings(userId: string) {
    try {
      console.log('🔍 DEBUG - getUserBookings called for userId:', userId);
      const bookings = await this.prisma.booking.findMany({
        where: { userId },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              airlineInfo: true,
              flightClassInfo: true,
              aircraftInfo: true,
            },
          },
          passengersInfo: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { bookingDate: 'desc' },
      });
      console.log('🔍 DEBUG - Found bookings:', bookings.length);

      // Transform the response to match frontend expectations
      return bookings.map(booking => ({
        ...booking,
        flight: booking.flight ? {
          ...booking.flight,
          departure: {
            dateTime: booking.flight.departureTime,
            city: booking.flight.departureAirport?.city ? 
              (typeof booking.flight.departureAirport.city === 'string' ? 
                JSON.parse(booking.flight.departureAirport.city) : 
                booking.flight.departureAirport.city) : 
              { fa: 'نامشخص', en: 'Unknown' },
            airport: booking.flight.departureAirport?.iata || 'UNK',
            airportName: booking.flight.departureAirport?.name ? 
              (typeof booking.flight.departureAirport.name === 'string' ? 
                JSON.parse(booking.flight.departureAirport.name) : 
                booking.flight.departureAirport.name) : 
              { fa: 'نامشخص', en: 'Unknown' }
          },
          arrival: {
            dateTime: booking.flight.arrivalTime,
            city: booking.flight.arrivalAirport?.city ? 
              (typeof booking.flight.arrivalAirport.city === 'string' ? 
                JSON.parse(booking.flight.arrivalAirport.city) : 
                booking.flight.arrivalAirport.city) : 
              { fa: 'نامشخص', en: 'Unknown' },
            airport: booking.flight.arrivalAirport?.iata || 'UNK',
            airportName: booking.flight.arrivalAirport?.name ? 
              (typeof booking.flight.arrivalAirport.name === 'string' ? 
                JSON.parse(booking.flight.arrivalAirport.name) : 
                booking.flight.arrivalAirport.name) : 
              { fa: 'نامشخص', en: 'Unknown' }
          }
        } : null
      }));
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async getBookingById(id: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
            aircraftInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async getBookingStats() {
    const totalBookings = await this.prisma.booking.count();
    const confirmedBookings = await this.prisma.booking.count({
      where: { status: BookingStatus.CONFIRMED },
    });
    const pendingBookings = await this.prisma.booking.count({
      where: { status: BookingStatus.PENDING },
    });
    const cancelledBookings = await this.prisma.booking.count({
      where: { status: BookingStatus.CANCELLED },
    });

    const totalRevenue = await this.prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: BookingStatus.CONFIRMED },
    });

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }

  private async createAccountingEntries(bookingId: string, totalAmount: number, userId: string) {
    try {
      console.log(`Creating accounting entries for booking ${bookingId}, amount: ${totalAmount}`);

      // Create journal entry
      const journalEntry = await this.prisma.journalEntry.create({
        data: {
          description: `Booking ${bookingId} - Ticket Sales`,
          date: new Date(),
        },
      });

      // Create transactions
      await this.prisma.transaction.createMany({
        data: [
          // Debit: Cash/Bank Account (1111)
          {
            journalEntryId: journalEntry.id,
            accountId: '1111',
            debit: totalAmount,
            credit: 0,
          },
          // Credit: Ticket Sales Revenue (4011)
          {
            journalEntryId: journalEntry.id,
            accountId: '4011',
            debit: 0,
            credit: totalAmount,
          },
        ],
      });

      console.log(`Journal entry created: ${journalEntry.id}`);

      // Update user wallet
      const wallet = await this.prisma.wallet.upsert({
        where: { 
          userId_currency: {
            userId,
            currency: 'IRR'
          }
        },
        update: {
          balance: {
            increment: BigInt(totalAmount),
          },
        },
        create: {
          userId,
          balance: BigInt(totalAmount),
          currency: 'IRR',
        },
      });

      // Create wallet transaction
      await this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: BigInt(totalAmount),
          type: 'CREDIT',
          description: `Booking ${bookingId} - Ticket purchase`,
          referenceId: bookingId,
          referenceType: 'BOOKING',
        } as any,
      });

      console.log(`Wallet updated: ${wallet.id}, new balance: ${Number(wallet.balance)}`);
      console.log(`✅ Accounting entries and wallet transaction created successfully for booking ${bookingId}`);
    } catch (error) {
      console.error('❌ Error creating accounting entries:', error);
      console.error('Error details:', {
        bookingId,
        totalAmount,
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      // Don't throw error to avoid breaking the booking creation
      // In production, you might want to handle this differently
    }
  }

  async getETicketData(userId: string, bookingId: string) {
    const booking = await this.getBookingById(bookingId, userId);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      bookingId: booking.id,
      ticketNumber: `TK${booking.id.slice(-8).toUpperCase()}`,
      status: booking.status,
      totalPrice: Number(booking.totalPrice),
      currency: 'IRR',
    };
  }

  async generateETicketPDF(userId: string, bookingId: string): Promise<Buffer> {
    try {
      // Get booking details
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: userId,
        },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
            },
          },
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Create a simple PDF content (HTML-based)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>E-Ticket - ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .ticket-info { border: 1px solid #ccc; padding: 20px; margin: 20px 0; }
            .flight-details { display: flex; justify-content: space-between; margin: 20px 0; }
            .passenger-info { margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-Ticket</h1>
            <h2>Trevel Airlines</h2>
          </div>
          
          <div class="ticket-info">
            <h3>Booking Information</h3>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Passenger:</strong> ${booking.user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${booking.contactEmail}</p>
            <p><strong>Phone:</strong> ${booking.contactPhone}</p>
            <p><strong>Total Price:</strong> ${booking.totalPrice} IRR</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Source:</strong> ${booking.source}</p>
          </div>

          <div class="flight-details">
            <div>
              <h4>Departure</h4>
              <p><strong>Airport:</strong> ${booking.flight?.departureAirport?.name || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking.flight?.departureTime ? new Date(booking.flight.departureTime).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <h4>Arrival</h4>
              <p><strong>Airport:</strong> ${booking.flight?.arrivalAirport?.name || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking.flight?.arrivalTime ? new Date(booking.flight.arrivalTime).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div class="passenger-info">
            <h3>Passengers</h3>
            ${booking.passengersData ? JSON.parse(booking.passengersData).map((p: any) => `<p>${p.name}</p>`).join('') : 'No passenger data'}
          </div>

          <div class="footer">
            <p>Thank you for choosing Trevel Airlines!</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      // Convert HTML to PDF buffer (simplified approach)
      // For now, return HTML content as buffer - frontend can handle conversion
      return Buffer.from(htmlContent, 'utf-8');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${(error as Error).message}`);
    }
  }
}