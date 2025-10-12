import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '@prisma/client';
import { CRSBookingService, BookingRequest, BookingConfirmationRequest } from './crs-booking.service';

@ApiTags('crs-booking')
@Controller({ path: 'booking', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CRSBookingController {
  constructor(private readonly crsBookingService: CRSBookingService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new booking with CRS flow' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking request' })
  async createBooking(
    user: User,
    @Body() bookingRequest: BookingRequest
  ) {
    try {
      // Validate booking request
      if (!bookingRequest.flightId || !bookingRequest.passengers || bookingRequest.passengers.length === 0) {
        throw new HttpException(
          { success: false, error: 'Invalid booking request' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate contact info
      if (!bookingRequest.contactInfo?.email || !bookingRequest.contactInfo?.phone) {
        throw new HttpException(
          { success: false, error: 'Contact information is required' },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.crsBookingService.createBooking(bookingRequest, user.id);
      
      if (result.success) {
        return {
          success: true,
          data: result,
          message: 'Booking created successfully'
        };
      } else {
        throw new HttpException(
          { success: false, error: result.error },
          HttpStatus.BAD_REQUEST
        );
      }

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:bookingId')
  @ApiOperation({ summary: 'Get booking status' })
  @ApiResponse({ status: 200, description: 'Booking status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingStatus(
    user: User,
    @Param('bookingId') bookingId: string
  ) {
    try {
      const result = await this.crsBookingService.getBookingStatus(bookingId, user.id);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('user-bookings')
  @ApiOperation({ summary: 'Get user bookings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  async getUserBookings(
    user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    try {
      const result = await this.crsBookingService.getUserBookings(user.id, page, limit);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/confirm')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin confirm/reject/cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking action completed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async confirmBooking(
    adminUser: User,
    @Body() confirmationRequest: BookingConfirmationRequest
  ) {
    try {
      const result = await this.crsBookingService.confirmBooking(confirmationRequest, adminUser.id);
      
      return {
        success: true,
        data: result,
        message: `Booking ${confirmationRequest.action.toLowerCase()}ed successfully`
      };

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('admin/all-bookings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all bookings for admin' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by booking status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'All bookings retrieved successfully' })
  async getAllBookings(
    adminUser: User,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    try {
      // This would be implemented in the service
      const result = await this.crsBookingService.getUserBookings('admin', page, limit);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/booking/:bookingId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get booking details for admin' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingDetails(
    adminUser: User,
    @Param('bookingId') bookingId: string
  ) {
    try {
      // This would get booking details for admin review
      const result = await this.crsBookingService.getBookingStatus(bookingId, 'admin');
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
