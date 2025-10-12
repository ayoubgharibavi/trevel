import { Controller, Get, Post, Param, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { WalletBlockService } from './wallet-block.service';
import { SepehrApiService } from '../sepehr/sepehr-api.service';

@ApiTags('admin-bookings')
@Controller({ path: 'admin/bookings', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminBookingsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletBlockService: WalletBlockService,
    private readonly sepehrApiService: SepehrApiService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings for admin' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async getAllBookings() {
    try {
      const bookings = await this.prisma.booking.findMany({
        include: {
          flight: {
            include: {
              airline: true,
              departure: true,
              arrival: true
            }
          },
          passengers: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          walletTransaction: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        flightId: booking.flightId,
        flightNumber: booking.flight.flightNumber,
        airline: booking.flight.airline.name,
        departure: {
          city: booking.flight.departure.city,
          airport: booking.flight.departure.airportCode,
          dateTime: booking.flight.departure.dateTime
        },
        arrival: {
          city: booking.flight.arrival.city,
          airport: booking.flight.arrival.airportCode,
          dateTime: booking.flight.arrival.dateTime
        },
        passengers: booking.passengers.map(passenger => ({
          id: passenger.id,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          gender: passenger.gender,
          birthDate: passenger.birthDate,
          nationality: passenger.nationality,
          seatNumber: passenger.seatNumber,
          ticketNumber: passenger.ticketNumber
        })),
        contactInfo: {
          email: booking.contactEmail,
          phone: booking.contactPhone
        },
        pricing: {
          basePrice: booking.basePrice,
          taxes: booking.taxes,
          totalPrice: booking.totalPrice,
          currency: 'IRR'
        },
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookingDate: booking.createdAt,
        confirmationDate: booking.confirmedAt,
        ticketIssuanceDate: booking.ticketIssuedAt,
        walletTransactionId: booking.walletTransactionId,
        sepehrBookingId: booking.sepehrBookingId,
        sepehrPnr: booking.sepehrPnr,
        notes: booking.notes
      }));

      return {
        success: true,
        data: {
          bookings: formattedBookings,
          total: bookings.length
        }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  async getBookingById(@Param('id') id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          flight: {
            include: {
              airline: true,
              departure: true,
              arrival: true
            }
          },
          passengers: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          walletTransaction: true
        }
      });

      if (!booking) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking and issue ticket' })
  @ApiResponse({ status: 200, description: 'Booking confirmed and ticket issued' })
  async confirmBooking(
    @Param('id') id: string,
    @Body() body: { notes?: string }
  ) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          flight: true,
          passengers: true,
          walletTransaction: true
        }
      });

      if (!booking) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      if (booking.status !== 'PENDING') {
        throw new HttpException(
          { success: false, error: 'Booking is not in pending status' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Confirm payment in wallet
      if (booking.walletTransactionId) {
        await this.walletBlockService.confirmPayment(booking.walletTransactionId, booking.id);
      }

      // Update booking status
      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          notes: body.notes || booking.notes
        }
      });

      // Issue ticket automatically
      const ticketData = await this.issueTicket(booking);

      return {
        success: true,
        data: {
          booking: updatedBooking,
          ticket: ticketData
        },
        message: 'Booking confirmed and ticket issued successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject booking and refund blocked funds' })
  @ApiResponse({ status: 200, description: 'Booking rejected and funds refunded' })
  async rejectBooking(
    @Param('id') id: string,
    @Body() body: { notes?: string }
  ) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          walletTransaction: true
        }
      });

      if (!booking) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      if (booking.status !== 'PENDING') {
        throw new HttpException(
          { success: false, error: 'Booking is not in pending status' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Unblock funds in wallet
      if (booking.walletTransactionId) {
        await this.walletBlockService.unblockFunds({
          transactionId: booking.walletTransactionId,
          reason: `Booking rejected: ${body.notes || 'No reason provided'}`
        });
      }

      // Update booking status
      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          status: 'REJECTED',
          notes: body.notes || booking.notes
        }
      });

      return {
        success: true,
        data: updatedBooking,
        message: 'Booking rejected and funds refunded successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancelBooking(
    @Param('id') id: string,
    @Body() body: { notes?: string }
  ) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      if (booking.status === 'CANCELLED') {
        throw new HttpException(
          { success: false, error: 'Booking is already cancelled' },
          HttpStatus.BAD_REQUEST
        );
      }

      // Update booking status
      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: body.notes || booking.notes
        }
      });

      return {
        success: true,
        data: updatedBooking,
        message: 'Booking cancelled successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/issue-ticket')
  @ApiOperation({ summary: 'Issue ticket for confirmed booking' })
  @ApiResponse({ status: 200, description: 'Ticket issued successfully' })
  async issueTicketForBooking(@Param('id') id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          flight: true,
          passengers: true
        }
      });

      if (!booking) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      if (booking.status !== 'CONFIRMED') {
        throw new HttpException(
          { success: false, error: 'Booking must be confirmed before issuing ticket' },
          HttpStatus.BAD_REQUEST
        );
      }

      const ticketData = await this.issueTicket(booking);

      // Update booking with ticket issuance date
      await this.prisma.booking.update({
        where: { id },
        data: {
          ticketIssuedAt: new Date(),
          status: 'COMPLETED'
        }
      });

      return {
        success: true,
        data: ticketData,
        message: 'Ticket issued successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Issue ticket for passengers
   */
  private async issueTicket(booking: any) {
    try {
      // Generate ticket numbers and seat assignments
      const ticketData = booking.passengers.map((passenger: any, index: number) => {
        const ticketNumber = `TK${Date.now()}${index + 1}`;
        const seatNumber = `${String.fromCharCode(65 + Math.floor(index / 6))}${(index % 6) + 1}`;

        return {
          passengerId: passenger.id,
          ticketNumber,
          seatNumber,
          issuedAt: new Date().toISOString()
        };
      });

      // Update passengers with ticket information
      for (const ticket of ticketData) {
        await this.prisma.passenger.update({
          where: { id: ticket.passengerId },
          data: {
            ticketNumber: ticket.ticketNumber,
            seatNumber: ticket.seatNumber
          }
        });
      }

      return {
        bookingId: booking.id,
        flightNumber: booking.flight.flightNumber,
        tickets: ticketData,
        issuedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to issue ticket: ${error.message}`);
    }
  }
}

