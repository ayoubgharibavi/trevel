import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletBlockService } from './wallet-block.service';
import { SepehrApiService } from '../sepehr/sepehr-api.service';

export interface BookingRequest {
  flightId: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    nationality: string;
    passportNumber?: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
  };
  paymentMethod: 'wallet' | 'card' | 'bank_transfer';
  specialRequests?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  paymentStatus: 'BLOCKED' | 'PAID' | 'REFUNDED' | 'FAILED';
  totalAmount: number;
  currency: string;
  confirmationCode?: string;
  pnr?: string;
  ticketNumbers?: string[];
  message?: string;
  error?: string;
}

export interface BookingConfirmationRequest {
  bookingId: string;
  adminNotes?: string;
  action: 'CONFIRM' | 'REJECT' | 'CANCEL';
}

@Injectable()
export class CRSBookingService {
  private readonly logger = new Logger(CRSBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletBlockService: WalletBlockService,
    private readonly sepehrApiService: SepehrApiService
  ) {}

  /**
   * ایجاد رزرو جدید با فلوی CRS
   */
  async createBooking(request: BookingRequest, userId: string): Promise<BookingResponse> {
    this.logger.log(`🔍 Creating booking for user ${userId}, flight ${request.flightId}`);

    try {
      // Step 1: Validate flight availability
      const flight = await this.validateFlightAvailability(request.flightId);
      if (!flight) {
        throw new Error('Flight not available');
      }

      // Step 2: Calculate pricing
      const pricing = await this.calculatePricing(request, flight);
      
      // Step 3: Block funds in wallet
      const walletBlock = await this.blockFundsForBooking(userId, pricing.totalAmount, request.flightId);

      // Step 4: Create booking record
      const booking = await this.createBookingRecord(request, userId, pricing, walletBlock.transactionId);

      // Step 5: Send to external provider (Sepehr)
      const externalBooking = await this.sendToExternalProvider(booking, request);

      // Step 6: Update booking with external data
      const updatedBooking = await this.updateBookingWithExternalData(booking.id, externalBooking);

      this.logger.log(`✅ Booking created successfully: ${booking.id}`);

      return {
        success: true,
        bookingId: booking.id,
        status: 'PENDING',
        paymentStatus: 'BLOCKED',
        totalAmount: pricing.totalAmount,
        currency: 'IRR',
        confirmationCode: booking.confirmationCode,
        message: 'Booking created successfully. Awaiting admin confirmation.'
      };

    } catch (error) {
      this.logger.error(`❌ Failed to create booking: ${error.message}`);
      
      // Cleanup: Unblock funds if booking creation failed
      if (request.flightId) {
        try {
          await this.walletBlockService.unblockFunds({
            transactionId: 'temp',
            reason: 'Booking creation failed'
          });
        } catch (cleanupError) {
          this.logger.error(`❌ Failed to cleanup funds: ${cleanupError.message}`);
        }
      }

      return {
        success: false,
        status: 'REJECTED',
        paymentStatus: 'FAILED',
        totalAmount: 0,
        currency: 'IRR',
        error: error.message
      };
    }
  }

  /**
   * تأیید رزرو توسط ادمین
   */
  async confirmBooking(request: BookingConfirmationRequest, adminUserId: string): Promise<BookingResponse> {
    this.logger.log(`🔍 Admin ${adminUserId} ${request.action} booking ${request.bookingId}`);

    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          flight: true,
          user: true,
          walletBlocks: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'PENDING') {
        throw new Error('Booking is not in pending status');
      }

      switch (request.action) {
        case 'CONFIRM':
          return await this.confirmBookingAction(booking, request.adminNotes);
        case 'REJECT':
          return await this.rejectBookingAction(booking, request.adminNotes);
        case 'CANCEL':
          return await this.cancelBookingAction(booking, request.adminNotes);
        default:
          throw new Error('Invalid action');
      }

    } catch (error) {
      this.logger.error(`❌ Failed to ${request.action} booking: ${error.message}`);
      throw error;
    }
  }

  /**
   * دریافت وضعیت رزرو
   */
  async getBookingStatus(bookingId: string, userId: string): Promise<BookingResponse> {
    try {
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: userId
        },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              airlineInfo: true
            }
          },
          passengersInfo: true,
          tickets: true,
          walletBlocks: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      return {
        success: true,
        bookingId: booking.id,
        status: booking.status as any,
        paymentStatus: this.getPaymentStatus(booking.walletBlocks),
        totalAmount: booking.totalPrice || 0,
        currency: 'IRR',
        confirmationCode: booking.confirmationCode,
        pnr: booking.sepehrPnr,
        ticketNumbers: booking.tickets.map(t => t.id),
        message: 'Booking status retrieved successfully'
      };

    } catch (error) {
      this.logger.error(`❌ Failed to get booking status: ${error.message}`);
      throw error;
    }
  }

  /**
   * دریافت لیست رزروهای کاربر
   */
  async getUserBookings(userId: string, page: number = 1, limit: number = 10): Promise<{
    bookings: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [bookings, total] = await Promise.all([
        this.prisma.booking.findMany({
          where: { userId },
          include: {
            flight: {
              include: {
                departureAirport: true,
                arrivalAirport: true,
                airlineInfo: true
              }
            },
            passengersInfo: true,
            tickets: true
          },
          orderBy: { bookingDate: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.booking.count({
          where: { userId }
        })
      ]);

      return {
        bookings: bookings.map(booking => ({
          id: booking.id,
          flightNumber: booking.flight.flightNumber,
          airline: booking.flight.airlineInfo?.name,
          departure: {
            city: booking.flight.departureAirport?.city,
            airport: booking.flight.departureAirport?.code,
            dateTime: booking.flight.departureDateTime
          },
          arrival: {
            city: booking.flight.arrivalAirport?.city,
            airport: booking.flight.arrivalAirport?.code,
            dateTime: booking.flight.arrivalDateTime
          },
          passengers: booking.passengersInfo.length,
          totalPrice: booking.totalPrice,
          status: booking.status,
          bookingDate: booking.bookingDate,
          confirmationCode: booking.confirmationCode,
          tickets: booking.tickets.length
        })),
        total,
        page,
        limit
      };

    } catch (error) {
      this.logger.error(`❌ Failed to get user bookings: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async validateFlightAvailability(flightId: string): Promise<any> {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        flightClassInfo: true
      }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    // Check if flight is available for booking
    if (flight.status !== 'ACTIVE') {
      throw new Error('Flight is not available for booking');
    }

    return flight;
  }

  private async calculatePricing(request: BookingRequest, flight: any): Promise<{
    basePrice: number;
    taxes: number;
    fees: number;
    totalAmount: number;
  }> {
    const passengerCount = request.passengers.length;
    const basePrice = (flight.price || 0) * passengerCount;
    const taxes = (flight.taxes || 0) * passengerCount;
    const fees = (flight.fees || 0) * passengerCount;
    const totalAmount = basePrice + taxes + fees;

    return {
      basePrice,
      taxes,
      fees,
      totalAmount
    };
  }

  private async blockFundsForBooking(userId: string, amount: number, flightId: string): Promise<{
    transactionId: string;
    blockedAmount: number;
  }> {
    const blockRequest = {
      userId,
      amount,
      reason: 'Flight booking reservation',
      flightId,
      description: `Booking reservation for flight ${flightId}`
    };

    const result = await this.walletBlockService.blockFunds(blockRequest);
    
    return {
      transactionId: result.transactionId,
      blockedAmount: result.blockedAmount
    };
  }

  private async createBookingRecord(
    request: BookingRequest, 
    userId: string, 
    pricing: any, 
    walletBlock: any
  ): Promise<any> {
    const confirmationCode = this.generateConfirmationCode();
    
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        flightId: request.flightId,
        totalPrice: pricing.totalAmount,
        status: 'CONFIRMED', // Changed from PENDING to CONFIRMED for Sepehr bookings
        source: 'sepehr',
        contactEmail: request.contactInfo.email,
        contactPhone: request.contactInfo.phone,
        tenantId: 'tenant-1',
        passengersData: JSON.stringify(request.passengers),
        searchQuery: '',
        notes: request.specialRequests || 'Sepehr booking - Automatically confirmed',
        confirmationCode,
        walletTransactionId: walletBlock.transactionId
      },
      include: {
        flight: true,
        user: true
      }
    });

    // Create passenger records
    for (const passenger of request.passengers) {
      await this.prisma.savedPassenger.create({
        data: {
          userId,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          gender: passenger.gender,
          birthDate: new Date(passenger.birthDate),
          nationality: passenger.nationality,
          passportNumber: passenger.passportNumber,
          bookingId: booking.id
        }
      });
    }

    return booking;
  }

  private async sendToExternalProvider(booking: any, request: BookingRequest): Promise<any> {
    try {
      // Send to Sepehr API
      const sepehrBookingRequest = {
        flightId: booking.flightId,
        passengers: request.passengers.map(p => ({
          name: `${p.firstName} ${p.lastName}`,
          type: 'adult' as const
        })),
        contactInfo: request.contactInfo
      };

      const sepehrResponse = await this.sepehrApiService.bookFlight(sepehrBookingRequest);
      
      return {
        sepehrBookingId: sepehrResponse.data?.bookingId,
        sepehrPnr: sepehrResponse.data?.pnr,
        externalStatus: sepehrResponse.data?.status
      };

    } catch (error) {
      this.logger.warn(`⚠️ External provider booking failed: ${error.message}`);
      return {
        sepehrBookingId: null,
        sepehrPnr: null,
        externalStatus: 'FAILED'
      };
    }
  }

  private async updateBookingWithExternalData(bookingId: string, externalData: any): Promise<any> {
    return await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        sepehrBookingId: externalData.sepehrBookingId,
        sepehrPnr: externalData.sepehrPnr,
        notes: `${externalData.sepehrBookingId ? `Sepehr ID: ${externalData.sepehrBookingId}` : 'External booking failed'}`
      }
    });
  }

  private async confirmBookingAction(booking: any, adminNotes?: string): Promise<BookingResponse> {
    // Confirm payment
    if (booking.walletBlocks.length > 0) {
      await this.walletBlockService.confirmPayment(
        booking.walletBlocks[0].id, 
        booking.id
      );
    }

    // Update booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        notes: adminNotes || booking.notes
      }
    });

    // Issue tickets
    const tickets = await this.issueTickets(booking);

    return {
      success: true,
      bookingId: booking.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalAmount: booking.totalPrice || 0,
      currency: 'IRR',
      confirmationCode: booking.confirmationCode,
      pnr: booking.sepehrPnr,
      ticketNumbers: tickets.map(t => t.id),
      message: 'Booking confirmed and tickets issued'
    };
  }

  private async rejectBookingAction(booking: any, adminNotes?: string): Promise<BookingResponse> {
    // Unblock funds
    if (booking.walletBlocks.length > 0) {
      await this.walletBlockService.unblockFunds({
        transactionId: booking.walletBlocks[0].id,
        reason: `Booking rejected: ${adminNotes || 'No reason provided'}`
      });
    }

    // Update booking status
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'REJECTED',
        notes: adminNotes || booking.notes
      }
    });

    return {
      success: true,
      bookingId: booking.id,
      status: 'REJECTED',
      paymentStatus: 'REFUNDED',
      totalAmount: booking.totalPrice || 0,
      currency: 'IRR',
      message: 'Booking rejected and funds refunded'
    };
  }

  private async cancelBookingAction(booking: any, adminNotes?: string): Promise<BookingResponse> {
    // Update booking status
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancellationDate: new Date(),
        notes: adminNotes || booking.notes
      }
    });

    return {
      success: true,
      bookingId: booking.id,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      totalAmount: booking.totalPrice || 0,
      currency: 'IRR',
      message: 'Booking cancelled'
    };
  }

  private async issueTickets(booking: any): Promise<any[]> {
    const tickets = [];
    
    for (const passenger of booking.passengersInfo) {
      const ticket = await this.prisma.ticket.create({
        data: {
          userId: booking.userId,
          bookingId: booking.id,
          subject: `Flight Ticket - ${booking.flight.flightNumber}`,
          status: 'CLOSED',
          priority: 'HIGH'
        }
      });
      
      tickets.push(ticket);
    }

    return tickets;
  }

  private generateConfirmationCode(): string {
    return `BK${Date.now().toString(36).toUpperCase()}`;
  }

  private getPaymentStatus(walletBlocks: any[]): 'BLOCKED' | 'PAID' | 'REFUNDED' | 'FAILED' {
    if (walletBlocks.length === 0) return 'FAILED';
    
    const latestBlock = walletBlocks[0];
    if (latestBlock.status === 'COMPLETED') return 'PAID';
    if (latestBlock.status === 'CANCELLED') return 'REFUNDED';
    if (latestBlock.status === 'PENDING') return 'BLOCKED';
    
    return 'FAILED';
  }
}

