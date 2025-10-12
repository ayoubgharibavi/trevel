import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SepehrApiService } from './sepehr-api.service';
import { SepehrFlightSearchDto, SepehrBookingDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { MockBookingService } from './mock-booking.service';

@ApiTags('sepehr')
@Controller({ path: 'sepehr', version: '1' })
export class SepehrController {
  constructor(
    private readonly sepehrApiService: SepehrApiService,
    private readonly mockBookingService: MockBookingService,
  ) {}

  @Post('search')
  @Public()
  @ApiOperation({ summary: 'Search flights using Sepehr API' })
  async searchFlights(@Body() searchDto: any) {
    try {
      console.log('Received search request:', searchDto);
      const result = await this.sepehrApiService.searchFlights(searchDto);
      console.log('Search result:', result);
      return result;
    } catch (error: any) {
      console.error('Error in searchFlights:', error);
      throw error;
    }
  }

  @Post('simple-search')
  @Public()
  @ApiOperation({ summary: 'Simple search endpoint' })
  async simpleSearch() {
    try {
      const testRequest = {
        departureCity: 'تهران',
        arrivalCity: 'مشهد',
        departureDate: '2025-10-25',
        adults: 1,
        children: 0,
        infants: 0
      };
      
      const result = await this.sepehrApiService.searchFlights(testRequest);
      return result;
    } catch (error: any) {
      console.error('Error in simple-search:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Check Sepehr API health' })
  async checkHealth() {
    const isConnected = await this.sepehrApiService.checkConnection();
    return {
      success: isConnected,
      message: isConnected ? 'Sepehr API is connected' : 'Sepehr API is not available',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('flight/:id')
  @Public()
  @ApiOperation({ summary: 'Get flight details by ID' })
  async getFlightDetails(@Param('id') flightId: string) {
    return this.sepehrApiService.getFlightDetails(flightId);
  }

  @Post('booking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book a flight through Sepehr API' })
  async bookFlight(@Body() bookingDto: SepehrBookingDto) {
    // Transform SepehrBookingDto to SepehrBookingRequest format
    const bookingRequest = {
      flightId: bookingDto.flightId,
      passengers: bookingDto.passengers.map(passenger => ({
        name: `${passenger.firstName} ${passenger.lastName}`,
        type: 'adult' as const // Default to adult, could be enhanced based on age
      })),
      contactInfo: {
        email: bookingDto.contactInfo.email,
        phone: bookingDto.contactInfo.phone
      }
    };
    return this.sepehrApiService.bookFlight(bookingRequest);
  }

  @Get('booking/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking status' })
  async getBookingStatus(@Param('id') bookingId: string) {
    return this.sepehrApiService.getBookingStatus(bookingId);
  }

  @Post('booking/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(@Param('id') bookingId: string, @Body() body: { reason?: string }) {
    return this.sepehrApiService.cancelBooking(bookingId);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Sepehr bookings' })
  async getAllBookings() {
    return this.mockBookingService.getAllBookings();
  }

  @Get('credit-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Sepehr credit status' })
  async getCreditStatus() {
    return this.sepehrApiService.getCreditStatus();
  }

  @Post('complete-booking')
  @Public()
  @ApiOperation({ summary: 'Complete Sepehr booking flow: Book with Sepehr + Save to system' })
  async completeBooking(@Req() req: any, @Body() bookingDto: any) {
    try {
      console.log('🎯 Starting complete Sepehr booking flow...');
      
      // Step 1: Book with Sepehr API
      const sepehrBookingRequest = {
        flightId: bookingDto.flightId,
        passengers: bookingDto.passengers.map((passenger: any) => ({
          name: `${passenger.firstName} ${passenger.lastName}`,
          type: 'adult' as const,
          gender: passenger.gender,
          nationality: passenger.nationality,
          birthDate: passenger.birthDate,
          passportNumber: passenger.passportNumber,
          passportExpiryDate: passenger.passportExpiryDate
        })),
        contactInfo: {
          email: bookingDto.contactInfo.email,
          phone: bookingDto.contactInfo.phone,
          address: bookingDto.contactInfo.address
        }
      };

      const sepehrBooking = await this.sepehrApiService.bookFlight(sepehrBookingRequest);
      
      if (!sepehrBooking.success) {
        throw new Error('Sepehr booking failed');
      }

      console.log('✅ Sepehr booking successful:', sepehrBooking.data.bookingId);

      // Step 2: Save booking to our system
      const systemBookingData = {
        flightId: bookingDto.flightId,
        passengers: bookingDto.passengers.map((passenger: any) => ({
          name: `${passenger.firstName} ${passenger.lastName}`
        })),
        totalPrice: bookingDto.totalPrice,
        contactEmail: bookingDto.contactInfo.email,
        contactPhone: bookingDto.contactInfo.phone,
        sepehrBookingId: sepehrBooking.data.bookingId,
        sepehrPnr: sepehrBooking.data.pnr,
        flightData: {
          flightNumber: sepehrBooking.data.flight.flightNumber,
          airline: 'سپهر', // Default airline name
          aircraft: 'Boeing 737', // Default, should come from Sepehr response
          class: 'اقتصادی', // Default, should come from Sepehr response
          duration: 180, // Default, should come from Sepehr response
          taxes: 0, // Default, should come from Sepehr response
          availableSeats: 100, // Default, should come from Sepehr response
          totalCapacity: 150, // Default, should come from Sepehr response
          departure: sepehrBooking.data.flight.departure,
          arrival: sepehrBooking.data.flight.arrival,
          sourcingType: 'System',
          baggageAllowance: '20 KG', // Default, should come from Sepehr response
          stops: 0 // Default, should come from Sepehr response
        }
      };

      // Import BookingsService to create the booking
      const { BookingsService } = await import('../bookings/bookings.service');
      const { PrismaService } = await import('../prisma/prisma.service');
      const { WalletBlockService } = await import('../bookings/wallet-block.service');
      
      const prismaService = new PrismaService();
      const walletBlockService = new WalletBlockService(prismaService);
      const bookingsService = new BookingsService(prismaService, walletBlockService);
      
      const systemBooking = await bookingsService.createBooking(systemBookingData, req.user.userId);

      console.log('✅ System booking created:', systemBooking.booking?.id || 'Unknown ID');

      return {
        success: true,
        data: {
          sepehrBooking: sepehrBooking.data,
          systemBooking: systemBooking,
          message: 'Complete booking flow successful'
        },
        message: 'Booking completed successfully with Sepehr API and saved to system'
      };

    } catch (error: any) {
      console.error('❌ Complete Sepehr booking flow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Complete booking flow failed'
      };
    }
  }
}



















