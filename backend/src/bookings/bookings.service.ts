import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from '../common/dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(createBookingDto: CreateBookingDto, userId: string) {
    const { flightId, passengers, totalPrice, contactEmail, contactPhone, sepehrBookingId, sepehrPnr, charter118BookingId, charter118ConfirmationCode } = createBookingDto;

    console.log('🔍 DEBUG - createBookingDto:', createBookingDto);
    console.log('🔍 DEBUG - flightId:', flightId);
    console.log('🔍 DEBUG - passengers:', passengers);
    console.log('🔍 DEBUG - totalPrice:', totalPrice);
    console.log('🔍 DEBUG - sepehrBookingId:', sepehrBookingId);
    console.log('🔍 DEBUG - sepehrPnr:', sepehrPnr);
    console.log('🔍 DEBUG - charter118BookingId:', charter118BookingId);
    console.log('🔍 DEBUG - charter118ConfirmationCode:', charter118ConfirmationCode);

    if (!flightId) {
      throw new Error('flightId is required');
    }

    // For external API bookings (Sepehr, Charter118), create flight if it doesn't exist
    let flight = null;
    if (sepehrBookingId || charter118BookingId) {
      // For external API bookings, create/upsert the flight
      flight = await this.prisma.flight.upsert({
        where: { id: flightId },
        update: {},
        create: {
          id: flightId,
          flightNumber: flightId.startsWith('sepehr-') ? 'SP001' : 'C118-001',
          airline: flightId.startsWith('sepehr-') ? 'سپهر' : 'Charter118',
          aircraft: 'Boeing 737',
          flightClass: 'اقتصادی',
          duration: 180, // 3 hours
          price: BigInt(totalPrice),
          taxes: BigInt(0),
          availableSeats: 100,
          totalCapacity: 150,
          airlineId: undefined,
          aircraftId: undefined,
          flightClassId: undefined,
          departureAirportId: 'airport-1', // IKA
          arrivalAirportId: 'airport-4', // DXB
          departureTime: new Date(),
          arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          source: sepehrBookingId ? 'sepehr' : 'charter118'
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          airlineInfo: true,
          flightClassInfo: true,
          aircraftInfo: true,
        },
      });
    } else {
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
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        flightId,
        totalPrice: Number(totalPrice),
        status: BookingStatus.CONFIRMED, // All bookings are confirmed by default
        source: sepehrBookingId ? 'sepehr' : charter118BookingId ? 'charter118' : 'online',
        contactEmail: contactEmail || 'user@example.com',
        contactPhone: contactPhone || '+989000000000',
        tenantId: 'default-tenant',
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

    // Create accounting entries (only for local flights)
    if (!sepehrBookingId && !charter118BookingId) {
      await this.createAccountingEntries(booking.id, totalPrice, userId);
    }

    return booking;
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
        tenantId: '',
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

  async getUserBookings(userId: string) {
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

    // Transform the response to match frontend expectations
    return bookings.map(booking => ({
      ...booking,
      flight: booking.flight ? {
        ...booking.flight,
        departure: {
          dateTime: booking.flight.departureTime,
          city: booking.flight.departureAirport?.city ? JSON.parse(booking.flight.departureAirport.city) : { fa: 'نامشخص', en: 'Unknown' },
          airport: booking.flight.departureAirport?.iata || 'UNK',
          airportName: booking.flight.departureAirport?.name ? JSON.parse(booking.flight.departureAirport.name) : { fa: 'نامشخص', en: 'Unknown' }
        },
        arrival: {
          dateTime: booking.flight.arrivalTime,
          city: booking.flight.arrivalAirport?.city ? JSON.parse(booking.flight.arrivalAirport.city) : { fa: 'نامشخص', en: 'Unknown' },
          airport: booking.flight.arrivalAirport?.iata || 'UNK',
          airportName: booking.flight.arrivalAirport?.name ? JSON.parse(booking.flight.arrivalAirport.name) : { fa: 'نامشخص', en: 'Unknown' }
        }
      } : null
    }));
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
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}