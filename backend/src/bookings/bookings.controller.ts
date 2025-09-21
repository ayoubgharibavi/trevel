import { Controller, Get, Post, UseGuards, Req, Body, Param, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from '../common/dto';

@ApiTags('bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

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
  @ApiOperation({ summary: 'Create new booking' })
  @ApiBody({ type: CreateBookingDto })
  async createBooking(@Req() req: any, @Body() body: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(@Req() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.getBooking(req.user.userId, bookingId);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiBody({ type: CancelBookingDto })
  async cancelBooking(@Req() req: any, @Param('id') bookingId: string, @Body() body: CancelBookingDto) {
    return this.bookingsService.cancelBooking(req.user.userId, bookingId, body.reason);
  }

  @Get(':id/e-ticket')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get e-ticket' })
  async getETicket(@Req() req: any, @Param('id') bookingId: string) {
    return this.bookingsService.getETicket(req.user.userId, bookingId);
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
}
