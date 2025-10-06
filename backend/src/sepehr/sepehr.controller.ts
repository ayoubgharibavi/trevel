import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
  async searchFlights(@Body() searchDto: SepehrFlightSearchDto) {
    return this.sepehrApiService.searchFlights(searchDto);
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
}



















