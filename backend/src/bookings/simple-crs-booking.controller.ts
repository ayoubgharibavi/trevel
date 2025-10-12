import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('simple-booking')
export class SimpleCRSBookingController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('create')
  async createBooking(@Body() bookingRequest: any) {
    try {
      console.log('📝 Creating booking:', bookingRequest);
      
      if (!bookingRequest.flightId || !bookingRequest.passengers || bookingRequest.passengers.length === 0) {
        throw new HttpException(
          { success: false, error: 'Invalid booking request' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!bookingRequest.contactInfo?.email || !bookingRequest.contactInfo?.phone) {
        throw new HttpException(
          { success: false, error: 'Contact information is required' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Create booking record
      const booking = await this.prisma.booking.create({
        data: {
          userId: bookingRequest.userId,
          flightId: bookingRequest.flightId,
          totalPrice: bookingRequest.totalPrice,
          status: 'CONFIRMED', // Changed from PENDING to CONFIRMED for direct bookings
          source: 'crs',
          contactEmail: bookingRequest.contactInfo.email,
          contactPhone: bookingRequest.contactInfo.phone,
          tenantId: 'tenant-1',
          passengersData: JSON.stringify(bookingRequest.passengers),
          searchQuery: '',
          notes: 'CRS Booking - Automatically confirmed'
        }
      });

      // Create passenger records
      for (const passenger of bookingRequest.passengers) {
        await this.prisma.savedPassenger.create({
          data: {
            userId: bookingRequest.userId,
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            gender: passenger.gender,
            nationality: passenger.nationality,
            bookingId: booking.id
          }
        });
      }

      console.log('✅ Booking created successfully:', booking.id);

      return {
        success: true,
        data: {
          bookingId: booking.id,
          status: 'CONFIRMED',
          message: 'Booking created and confirmed successfully.'
        },
        message: 'Booking created and confirmed successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to create booking:', error);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('test')
  async test() {
    return {
      success: true,
      message: 'Simple CRS Booking API is working!',
      timestamp: new Date().toISOString()
    };
  }
}