import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Charter118Service, Charter118FlightSearchRequest, Charter118BookingRequest } from './charter118.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Charter118 Integration')
@Controller('charter118')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class Charter118Controller {
  private readonly logger = new Logger(Charter118Controller.name);

  constructor(private readonly charter118Service: Charter118Service) {}

  @Post('search')
  @Public()
  @ApiOperation({ summary: 'جستجوی پروازها در Charter118' })
  @ApiResponse({ status: 200, description: 'نتایج جستجوی پروازها' })
  @ApiResponse({ status: 400, description: 'درخواست نامعتبر' })
  async searchFlights(@Body() searchRequest: Charter118FlightSearchRequest) {
    this.logger.log(`Flight search request: ${searchRequest.origin} → ${searchRequest.destination}`);
    
    const result = await this.charter118Service.searchFlights(searchRequest);
    
    if (!result.success) {
      this.logger.warn(`Flight search failed: ${result.error}`);
    }
    
    return result;
  }

  @Get('flight/:id')
  @Public()
  @ApiOperation({ summary: 'دریافت جزئیات پرواز از Charter118' })
  @ApiResponse({ status: 200, description: 'جزئیات پرواز' })
  @ApiResponse({ status: 404, description: 'پرواز یافت نشد' })
  async getFlightDetails(@Param('id') flightId: string) {
    this.logger.log(`Getting flight details for ID: ${flightId}`);
    
    const result = await this.charter118Service.getFlightDetails(flightId);
    
    if (!result.success) {
      this.logger.warn(`Get flight details failed: ${result.error}`);
    }
    
    return result;
  }

  @Post('book')
  @Roles('ADMIN', 'SUPER_ADMIN', 'USER')
  @ApiOperation({ summary: 'رزرو پرواز در Charter118' })
  @ApiResponse({ status: 200, description: 'رزرو موفقیت‌آمیز' })
  @ApiResponse({ status: 400, description: 'درخواست رزرو نامعتبر' })
  async bookFlight(@Body() bookingRequest: Charter118BookingRequest) {
    this.logger.log(`Booking request for flight: ${bookingRequest.flightId}`);
    
    const result = await this.charter118Service.bookFlight(bookingRequest);
    
    if (!result.success) {
      this.logger.warn(`Booking failed: ${result.error}`);
    } else {
      this.logger.log(`Booking successful: ${result.bookingId}`);
    }
    
    return result;
  }

  @Get('booking/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'USER')
  @ApiOperation({ summary: 'دریافت وضعیت رزرو از Charter118' })
  @ApiResponse({ status: 200, description: 'وضعیت رزرو' })
  @ApiResponse({ status: 404, description: 'رزرو یافت نشد' })
  async getBookingStatus(@Param('id') bookingId: string) {
    this.logger.log(`Getting booking status: ${bookingId}`);
    
    const result = await this.charter118Service.getBookingStatus(bookingId);
    
    if (!result.success) {
      this.logger.warn(`Get booking status failed: ${result.error}`);
    }
    
    return result;
  }

  @Delete('booking/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'USER')
  @ApiOperation({ summary: 'لغو رزرو در Charter118' })
  @ApiResponse({ status: 200, description: 'لغو موفقیت‌آمیز' })
  @ApiResponse({ status: 404, description: 'رزرو یافت نشد' })
  async cancelBooking(@Param('id') bookingId: string) {
    this.logger.log(`Cancelling booking: ${bookingId}`);
    
    const result = await this.charter118Service.cancelBooking(bookingId);
    
    if (!result.success) {
      this.logger.warn(`Cancel booking failed: ${result.error}`);
    } else {
      this.logger.log(`Booking cancelled successfully: ${bookingId}`);
    }
    
    return result;
  }

  @Get('airports')
  @Roles('ADMIN', 'SUPER_ADMIN', 'USER')
  @ApiOperation({ summary: 'دریافت لیست فرودگاه‌ها از Charter118' })
  @ApiResponse({ status: 200, description: 'لیست فرودگاه‌ها' })
  async getAirports() {
    this.logger.log('Getting airports list from Charter118');
    
    const result = await this.charter118Service.getAirports();
    
    if (!result.success) {
      this.logger.warn(`Get airports failed: ${result.error}`);
    }
    
    return result;
  }

  @Get('airlines')
  @Roles('ADMIN', 'SUPER_ADMIN', 'USER')
  @ApiOperation({ summary: 'دریافت لیست ایرلاین‌ها از Charter118' })
  @ApiResponse({ status: 200, description: 'لیست ایرلاین‌ها' })
  async getAirlines() {
    this.logger.log('Getting airlines list from Charter118');
    
    const result = await this.charter118Service.getAirlines();
    
    if (!result.success) {
      this.logger.warn(`Get airlines failed: ${result.error}`);
    }
    
    return result;
  }

  @Get('test-connection')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'تست اتصال به Charter118 API' })
  @ApiResponse({ status: 200, description: 'نتیجه تست اتصال' })
  async testConnection() {
    this.logger.log('Testing Charter118 API connection');
    
    const result = await this.charter118Service.testConnection();
    
    if (!result.success) {
      this.logger.warn(`Connection test failed: ${result.message}`);
    } else {
      this.logger.log('Charter118 API connection test successful');
    }
    
    return result;
  }

  @Get('health')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'بررسی وضعیت Charter118 API' })
  @ApiResponse({ status: 200, description: 'وضعیت API' })
  async healthCheck() {
    this.logger.log('Checking Charter118 API health');
    
    const result = await this.charter118Service.testConnection();
    
    return {
      service: 'Charter118 Integration',
      status: result.success ? 'healthy' : 'unhealthy',
      message: result.message,
      timestamp: new Date().toISOString(),
      data: result.data
    };
  }
}

















