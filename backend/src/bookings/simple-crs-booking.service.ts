import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SimpleCRSBookingService {
  private readonly logger = new Logger(SimpleCRSBookingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSimpleBooking(request: any, userId: string): Promise<any> {
    this.logger.log(`🔍 Creating simple booking for user ${userId}, flight ${request.flightId}`);

    try {
      // Create booking record
      const booking = await this.prisma.booking.create({
        data: {
          userId,
          flightId: request.flightId,
          totalPrice: request.totalPrice,
          status: 'CONFIRMED', // Changed from PENDING to CONFIRMED for direct bookings
          source: 'crs',
          contactEmail: request.contactInfo.email,
          contactPhone: request.contactInfo.phone,
          tenantId: 'tenant-1',
          passengersData: JSON.stringify(request.passengers),
          searchQuery: '',
          notes: 'CRS Booking - Automatically confirmed'
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
            nationality: passenger.nationality,
            bookingId: booking.id
          }
        });
      }

      this.logger.log(`✅ Simple booking created successfully: ${booking.id}`);

      return {
        success: true,
        bookingId: booking.id,
        status: 'CONFIRMED',
        message: 'Booking created and confirmed successfully.'
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to create simple booking: ${error.message}`);
      
      return {
        success: false,
        status: 'REJECTED',
        error: error.message
      };
    }
  }

  async getUserBookings(userId: string, page: number = 1, limit: number = 10): Promise<any> {
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
          flightNumber: booking.flight?.flightNumber || 'N/A',
          airline: booking.flight?.airlineInfo?.name || 'N/A',
          departure: {
            city: booking.flight?.departureAirport?.city || 'N/A',
            airport: booking.flight?.departureAirport?.code || 'N/A',
            dateTime: booking.flight?.departureTime || 'N/A'
          },
          arrival: {
            city: booking.flight?.arrivalAirport?.city || 'N/A',
            airport: booking.flight?.arrivalAirport?.code || 'N/A',
            dateTime: booking.flight?.arrivalTime || 'N/A'
          },
          passengers: booking.passengersInfo?.length || 0,
          totalPrice: booking.totalPrice,
          status: booking.status,
          bookingDate: booking.bookingDate,
          tickets: booking.tickets?.length || 0
        })),
        total,
        page,
        limit
      };

    } catch (error: any) {
      this.logger.error(`❌ Failed to get user bookings: ${error.message}`);
      throw error;
    }
  }
}