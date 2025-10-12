import { Controller, Get, Post, UseGuards, Req, Body, Param, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from '../common/dto';
import { Public } from '../auth/decorators/public.decorator';
import { SepehrApiService } from '../sepehr/sepehr-api.service';

@ApiTags('bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly sepehrApiService: SepehrApiService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings' })
  async getBookings(@Req() req: any) {
    return this.bookingsService.getUserBookings(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create booking' })
  @ApiBody({ type: CreateBookingDto })
  async createBooking(@Req() req: any, @Body() body: CreateBookingDto) {
    console.log('🔍 DEBUG - createBooking req.user:', req.user);
    console.log('🔍 DEBUG - Using userId:', req.user.userId);
    return this.bookingsService.createBooking(body, req.user.userId);
  }

  @Post('deduct-wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deduct amount from user wallet' })
  async deductFromWallet(@Req() req: any, @Body() body: { amount: number; bookingId: string; description: string }) {
    return this.bookingsService.deductFromWallet(req.user.userId, body.amount, body.bookingId, body.description);
  }

  @Post('manual')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create manual booking' })
  @ApiBody({ type: CreateBookingDto })
  async createManualBooking(@Req() req: any, @Body() body: CreateBookingDto) {
    console.log('🔍 DEBUG - req.user:', req.user);
    console.log('🔍 DEBUG - Using userId:', req.user.userId);
    return this.bookingsService.createManualBooking(body, req.user.userId);
  }

  @Post('sepehr-suspended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create suspended Sepehr booking' })
  @ApiBody({ type: CreateBookingDto })
  async createSuspendedSepehrBooking(@Req() req: any, @Body() body: CreateBookingDto) {
    return this.bookingsService.createSuspendedSepehrBooking(body, req.user.userId);
  }

  @Get('suspended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all suspended bookings' })
  async getSuspendedBookings() {
    return this.bookingsService.getSuspendedBookings();
  }

  @Post('confirm-suspended/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm suspended booking and deduct payment' })
  async confirmSuspendedBooking(@Param('blockId') blockId: string, @Req() req: any) {
    return this.bookingsService.confirmSuspendedBooking(blockId, req.user.userId);
  }

  @Post('reject-suspended/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject suspended booking and release payment' })
  async rejectSuspendedBooking(@Param('blockId') blockId: string, @Body() body: { reason?: string }, @Req() req: any) {
    return this.bookingsService.rejectSuspendedBooking(blockId, req.user.userId, body.reason);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(@Req() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.getBookingById(bookingId, req.user.userId);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiBody({ type: CancelBookingDto })
  async cancelBooking(@Req() req: any, @Param('id') bookingId: string, @Body() body: CancelBookingDto) {
    return this.bookingsService.cancelBooking(bookingId, req.user.userId);
  }

  @Get(':id/e-ticket')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get e-ticket' })
  async getETicket(@Req() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.getETicketData(req.user.userId, bookingId);
  }

  @Get(':id/e-ticket/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download e-ticket as PDF' })
  async downloadETicketPDF(@Req() req: any, @Param('id') bookingId: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.bookingsService.generateETicketPDF(req.user.userId, bookingId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="e-ticket-${bookingId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  @Post('simple-create')
  @ApiOperation({ summary: 'Create a simple booking' })
  async createSimpleBooking(@Body() bookingRequest: any) {
    try {
      console.log('📝 Creating simple booking:', bookingRequest);
      
      if (!bookingRequest.flightId || !bookingRequest.passengers || bookingRequest.passengers.length === 0) {
        return {
          success: false,
          error: 'Invalid booking request'
        };
      }

      if (!bookingRequest.contactInfo?.email || !bookingRequest.contactInfo?.phone) {
        return {
          success: false,
          error: 'Contact information is required'
        };
      }

      // Create booking record
      const booking = await this.bookingsService.prisma.booking.create({
        data: {
          userId: bookingRequest.userId,
          flightId: bookingRequest.flightId,
          totalPrice: bookingRequest.totalPrice,
          status: 'PENDING',
          source: 'crs',
          contactEmail: bookingRequest.contactInfo.email,
          contactPhone: bookingRequest.contactInfo.phone,
          tenantId: 'tenant-1',
          passengersData: JSON.stringify(bookingRequest.passengers),
          searchQuery: '',
          notes: 'CRS Booking - Awaiting admin confirmation'
        }
      });

      // Create passenger records
      for (const passenger of bookingRequest.passengers) {
        await this.bookingsService.prisma.savedPassenger.create({
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

      console.log('✅ Simple booking created successfully:', booking.id);

      return {
        success: true,
        data: {
          bookingId: booking.id,
          status: 'PENDING',
          message: 'Booking created successfully. Awaiting admin confirmation.'
        },
        message: 'Booking created successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to create simple booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('ticket-approve')
  @ApiOperation({ summary: 'Approve ticket for booking' })
  async approveTicketSimple(@Body() body: { bookingId: string; adminNotes?: string }) {
    try {
      console.log('🎫 Approving ticket for booking:', body.bookingId);

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: body.bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to CLOSED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CLOSED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets approved for booking:', body.bookingId);

      return {
        success: true,
        message: 'Tickets approved successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to approve tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('ticket-reject')
  @ApiOperation({ summary: 'Reject ticket for booking' })
  async rejectTicketSimple(@Body() body: { bookingId: string; adminNotes?: string }) {
    try {
      console.log('🎫 Rejecting ticket for booking:', body.bookingId);

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: body.bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to CANCELLED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CANCELLED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets rejected for booking:', body.bookingId);

      return {
        success: true,
        message: 'Tickets rejected successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to reject tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  @Post('ticket-reject')
  @ApiOperation({ summary: 'Reject ticket for booking' })
  async rejectTicketSimple(@Body() body: { bookingId: string; adminNotes?: string }) {
    try {
      console.log('🎫 Rejecting ticket for booking:', body.bookingId);

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: body.bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to CANCELLED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CANCELLED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets rejected for booking:', body.bookingId);

      return {
        success: true,
        message: 'Tickets rejected successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to reject tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }




















  @Post('admin/add-credit/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add credit to user wallet (Admin only)' })
  async addCreditToUser(@Param('userId') userId: string, @Body() creditData: { amount: number, reason?: string }) {
    try {
      console.log('💰 Admin adding credit to user:', userId, 'Amount:', creditData.amount);
      
      // Find user's wallet
      let wallet = await this.bookingsService.prisma.wallet.findFirst({
        where: { 
          userId,
          currency: 'IRR'
        }
      });

      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await this.bookingsService.prisma.wallet.create({
          data: {
            userId,
            balance: BigInt(creditData.amount),
            currency: 'IRR',
          },
        });
        console.log('✅ Created new wallet with credit:', creditData.amount);
      } else {
        // Add credit to existing wallet
        const newBalance = Number(wallet.balance) + creditData.amount;
        await this.bookingsService.prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: BigInt(newBalance) }
        });
        console.log('✅ Added credit to existing wallet. New balance:', newBalance);
      }

      // Create credit transaction record
      await this.bookingsService.prisma.walletTransaction.create({
        data: {
          userId,
          amount: BigInt(creditData.amount),
          type: 'DEPOSIT',
          description: creditData.reason || 'Admin credit addition',
          currency: 'IRR',
        },
      });

      return {
        success: true,
        message: `Successfully added ${creditData.amount.toLocaleString()} IRR to user wallet`,
        newBalance: Number(wallet.balance) + creditData.amount
      };
    } catch (error: any) {
      console.error('❌ Failed to add credit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('direct-sepehr')
  @Public()
  @ApiOperation({ summary: 'Create direct booking with Sepehr API' })
  async createDirectSepehrBooking(@Body() bookingRequest: any) {
    try {
      console.log('🚀 Creating REAL Sepehr booking:', bookingRequest);
      
      if (!bookingRequest.flightId || !bookingRequest.passengers || bookingRequest.passengers.length === 0) {
        return {
          success: false,
          error: 'Invalid booking request'
        };
      }

      if (!bookingRequest.contactInfo?.email || !bookingRequest.contactInfo?.phone) {
        return {
          success: false,
          error: 'Contact information is required'
        };
      }

      // Step 1: Book with REAL Sepehr API
      const sepehrBookingRequest = {
        flightId: bookingRequest.flightId,
        passengers: bookingRequest.passengers.map((passenger: any) => ({
          name: `${passenger.firstName} ${passenger.lastName}`,
          type: 'adult' as const,
          gender: passenger.gender,
          nationality: passenger.nationality,
          birthDate: passenger.birthDate || '1990-01-01',
          passportNumber: passenger.passportNumber || '',
          passportExpiryDate: passenger.passportExpiryDate || '2030-01-01'
        })),
        contactInfo: {
          email: bookingRequest.contactInfo.email,
          phone: bookingRequest.contactInfo.phone,
          address: bookingRequest.contactInfo.address || ''
        }
      };

      console.log('🎯 Calling REAL Sepehr API...');
      const sepehrBooking = await this.sepehrApiService.bookFlight(sepehrBookingRequest);
      
      if (!sepehrBooking.success) {
        throw new Error('Sepehr API booking failed');
      }

      console.log('✅ REAL Sepehr booking successful:', sepehrBooking.data.bookingId);

      // Step 2: Save booking to our system with real Sepehr data
      const bookingData = {
        flightId: bookingRequest.flightId,
        passengers: bookingRequest.passengers.map((passenger: any) => ({
          name: `${passenger.firstName} ${passenger.lastName}`
        })),
        totalPrice: bookingRequest.totalPrice,
        contactEmail: bookingRequest.contactInfo.email,
        contactPhone: bookingRequest.contactInfo.phone,
        sepehrBookingId: sepehrBooking.data.bookingId,
        sepehrPnr: sepehrBooking.data.pnr,
        flightData: {
          flightNumber: sepehrBooking.data.flight.flightNumber,
          airline: 'سپهر',
          aircraft: 'Boeing 737',
          class: 'اقتصادی',
          duration: 180,
          taxes: 0,
          availableSeats: 100,
          totalCapacity: 150,
          departure: sepehrBooking.data.flight.departure,
          arrival: sepehrBooking.data.flight.arrival,
          sourcingType: 'System',
          baggageAllowance: '20 KG',
          stops: 0
        }
      };

      const result = await this.bookingsService.createBooking(bookingData, bookingRequest.userId);
      const booking = result.booking;

      console.log('✅ REAL Sepehr booking created and confirmed:', booking.id);

      return {
        success: true,
        data: {
          bookingId: booking.id,
          sepehrBookingId: sepehrBooking.data.bookingId,
          sepehrPnr: sepehrBooking.data.pnr,
          status: 'CONFIRMED',
          message: 'REAL booking created with Sepehr API and confirmed in system'
        },
        message: 'REAL Sepehr booking completed successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to create REAL Sepehr booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/ticket-approve')
  @ApiOperation({ summary: 'Approve ticket for booking' })
  async approveTicketSimple(@Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      console.log('🎫 Approving ticket for booking:', bookingId);

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to CLOSED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CLOSED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets approved for booking:', bookingId);

      return {
        success: true,
        message: 'Tickets approved successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to approve tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/ticket-reject')
  @ApiOperation({ summary: 'Reject ticket for booking' })
  async rejectTicketSimple(@Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      console.log('🎫 Rejecting ticket for booking:', bookingId);

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to CANCELLED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CANCELLED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets rejected for booking:', bookingId);

      return {
        success: true,
        message: 'Tickets rejected successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to reject tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookings for admin' })
  async getAllBookings(@Req() req: any) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const bookings = await this.bookingsService.prisma.booking.findMany({
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              airlineInfo: true
            }
          },
          user: { select: { id: true, name: true, email: true } },
          passengersInfo: true,
          tickets: true
        },
        orderBy: { bookingDate: 'desc' }
      });

      return {
        success: true,
        bookings: bookings.map(booking => ({
          id: booking.id,
          userId: booking.userId,
          flightId: booking.flightId,
          totalPrice: booking.totalPrice,
          status: booking.status,
          contactEmail: booking.contactEmail,
          contactPhone: booking.contactPhone,
          passengersData: booking.passengersData,
          notes: booking.notes,
          bookingDate: booking.bookingDate,
          flight: booking.flight,
          user: booking.user,
          passengersInfo: booking.passengersInfo,
          tickets: booking.tickets
        }))
      };

    } catch (error: any) {
      console.error('❌ Failed to get all bookings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin confirm booking' })
  async confirmBooking(@Req() req: any, @Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          flight: true,
          passengersInfo: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      if (booking.status !== 'PENDING') {
        return {
          success: false,
          error: 'Booking is not in pending status'
        };
      }

      // Update booking status
      const updatedBooking = await this.bookingsService.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          notes: body.adminNotes || booking.notes
        }
      });

      // Issue tickets
      for (const passenger of booking.passengersInfo) {
        await this.bookingsService.prisma.ticket.create({
          data: {
            userId: booking.userId,
            bookingId: booking.id,
            subject: `Flight Ticket - ${booking.flight?.flightNumber}`,
            status: 'CLOSED',
            priority: 'HIGH'
          }
        });
      }

      console.log('✅ Booking confirmed and tickets issued:', bookingId);

      return {
        success: true,
        message: 'Booking confirmed and tickets issued successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to confirm booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin reject booking' })
  async rejectBooking(@Req() req: any, @Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      if (booking.status !== 'PENDING') {
        return {
          success: false,
          error: 'Booking is not in pending status'
        };
      }

      // Update booking status
      await this.bookingsService.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          notes: body.adminNotes || booking.notes
        }
      });

      console.log('✅ Booking rejected:', bookingId);

      return {
        success: true,
        message: 'Booking rejected successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to reject booking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/ticket/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin approve ticket' })
  async approveTicket(@Req() req: any, @Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to APPROVED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CLOSED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets approved for booking:', bookingId);

      return {
        success: true,
        message: 'Tickets approved successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to approve tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('admin/:bookingId/ticket/reject')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin reject ticket' })
  async rejectTicket(@Req() req: any, @Param('bookingId') bookingId: string, @Body() body: { adminNotes?: string }) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const booking = await this.bookingsService.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tickets: true
        }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update all tickets for this booking to REJECTED status
      for (const ticket of booking.tickets) {
        await this.bookingsService.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'CANCELLED',
            notes: body.adminNotes || ticket.notes
          }
        });
      }

      console.log('✅ Tickets rejected for booking:', bookingId);

      return {
        success: true,
        message: 'Tickets rejected successfully'
      };

    } catch (error: any) {
      console.error('❌ Failed to reject tickets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
