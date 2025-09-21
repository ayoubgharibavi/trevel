import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { name: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async createBooking(userId: string, data: any) {
    const { flightId, passengers, contactEmail, contactPhone, searchQuery } = data;

    if (!flightId || !passengers || !contactEmail || !contactPhone) {
      throw new BadRequestException('Missing required booking information');
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airlineInfo: true,
        flightClassInfo: true,
        commissionModel: true,
        refundPolicy: true,
      },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const totalPassengers = passengers.adults.length + passengers.children.length + passengers.infants.length;
    if (flight.availableSeats < totalPassengers) {
      throw new BadRequestException('Not enough seats available for this flight');
    }

    const totalPrice = new Prisma.Decimal(flight.price.toNumber() + flight.taxes.toNumber()).times(totalPassengers);
    const currency = 'IRR'; // Assuming IRR as default currency for now

    // Create booking and update available seats in a transaction
    const newBooking = await this.prisma.$transaction(async (prisma) => {
      const booking = await prisma.booking.create({
        data: {
          userId,
          flightId: flight.id,
          contactEmail,
          contactPhone,
          bookingDate: new Date(),
          status: BookingStatus.CONFIRMED,
          totalPrice,
          currency,
          passengersData: passengers, // Store raw passenger data as JSON
          searchQuery: searchQuery, // Store original search query as JSON
          tenantId: flight.tenantId, // Inherit tenantId from flight
          passengersInfo: {
            create: [...passengers.adults, ...passengers.children, ...passengers.infants].map((p: any) => ({
              firstName: p.firstName,
              lastName: p.lastName,
              nationality: p.nationality,
              gender: p.gender,
              nationalId: p.nationalId,
              passportNumber: p.passportNumber,
              passportIssuingCountry: p.passportIssuingCountry,
              dateOfBirth: p.dateOfBirth,
              passportExpiryDate: p.passportExpiryDate,
              userId, // Link saved passengers to the user who booked
            })),
          },
        },
        include: {
          passengersInfo: true,
          user: { select: { name: true } },
          flight: true,
        },
      });

      await prisma.flight.update({
        where: { id: flight.id },
        data: { availableSeats: { decrement: totalPassengers } },
      });

      return booking;
    });

    return {
      success: true,
      booking: newBooking,
      message: 'Booking successful',
    };
  }

  async getBooking(userId: string, bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { id: bookingId, userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            flightClassInfo: true,
          },
        },
        passengersInfo: true,
        user: { select: { name: true } },
      },
    });
  }

  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be cancelled');
    }

    // In a real application, you would calculate refund amounts based on policies
    // For now, we'll just set the status to CANCELLED and return a mock refundAmount
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED, cancellationReason: reason },
    });

    return {
      success: true,
      message: 'Cancellation request submitted and is under review',
      refundAmount: 9500000, // Example mock refund amount
      booking: updatedBooking,
    };
  }

  async getETicket(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, userId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true,
            airlineInfo: true,
            aircraft: true,
            flightClassInfo: true,
          },
        },
        passengersInfo: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      bookingId: booking.id,
      ticketNumber: `TKT-${booking.id}`,
      flight: {
        airline: booking.flight.airlineInfo.name as any,
        flightNumber: booking.flight.flightNumber,
        departure: {
          airport: booking.flight.departureAirport.name as any,
          city: booking.flight.departureAirport.city as any,
          dateTime: booking.flight.departureTime.toISOString(),
          terminal: booking.flight.departureTerminal,
          gate: booking.flight.departureGate,
        },
        arrival: {
          airport: booking.flight.arrivalAirport.name as any,
          city: booking.flight.arrivalAirport.city as any,
          dateTime: booking.flight.arrivalTime.toISOString(),
          terminal: booking.flight.arrivalTerminal,
          gate: booking.flight.arrivalGate,
        },
        aircraft: booking.flight.aircraft.name as any,
        flightClass: booking.flight.flightClassInfo.name as any,
      },
      passengers: booking.passengersInfo.map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        seatNumber: 'N/A', // Seat numbers are not in current schema, mock for now
        ticketNumber: `TKT-${booking.id}-${p.id.substring(0, 4)}`,
      })),
      baggageAllowance: booking.flight.baggageAllowance || 'N/A',
      status: booking.status,
      totalPrice: Number(booking.totalPrice),
      currency: booking.currency,
    };
  }

  async generateETicketPDF(userId: string, bookingId: string): Promise<Buffer> {
    const eTicketData = await this.getETicket(userId, bookingId);

    const departureDateTime = new Date(eTicketData.flight.departure.dateTime);
    const arrivalDateTime = new Date(eTicketData.flight.arrival.dateTime);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>E-Ticket ${bookingId}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 20px; direction: rtl; }
          .ticket { border: 2px solid #333; padding: 20px; max-width: 800px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 20px; background-color: #f0f0f0; padding: 10px; }
          .header h1 { color: #333; margin: 0; }
          .header h2 { color: #666; font-size: 1em; margin: 5px 0; }
          .section-title { background-color: #e0e0e0; padding: 5px 10px; margin-top: 20px; margin-bottom: 10px; border-left: 5px solid #007bff; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
          .info-item { padding: 5px; border: 1px solid #eee; }
          .info-item strong { display: block; color: #555; }
          .passenger-list { margin-top: 20px; }
          .passenger-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .passenger-card h4 { margin-top: 0; color: #007bff; }
          .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #777; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>بلیط الکترونیکی</h1>
            <h2>Electronic Ticket</h2>
          </div>

          <div class="section-title">اطلاعات رزرو</div>
          <div class="info-grid">
            <div class="info-item"><strong>شماره رزرو:</strong> ${eTicketData.bookingId}</div>
            <div class="info-item"><strong>شماره بلیط:</strong> ${eTicketData.ticketNumber}</div>
            <div class="info-item"><strong>وضعیت:</strong> ${eTicketData.status}</div>
            <div class="info-item"><strong>مبلغ کل:</strong> ${eTicketData.totalPrice.toLocaleString('fa-IR')} ${eTicketData.currency}</div>
          </div>

          <div class="section-title">اطلاعات پرواز</div>
          <div class="info-grid">
            <div class="info-item"><strong>ایرلاین:</strong> ${eTicketData.flight.airline.fa}</div>
            <div class="info-item"><strong>شماره پرواز:</strong> ${eTicketData.flight.flightNumber}</div>
            <div class="info-item"><strong>کلاس پرواز:</strong> ${eTicketData.flight.flightClass.fa}</div>
            <div class="info-item"><strong>مدل هواپیما:</strong> ${eTicketData.flight.aircraft.fa}</div>
          </div>

          <div class="section-title">اطلاعات مبدا</div>
          <div class="info-grid">
            <div class="info-item"><strong>شهر:</strong> ${eTicketData.flight.departure.city.fa}</div>
            <div class="info-item"><strong>فرودگاه:</strong> ${eTicketData.flight.departure.airport.fa} (${eTicketData.flight.departure.terminal ? `ترمینال ${eTicketData.flight.departure.terminal}` : ''}${eTicketData.flight.departure.gate ? `, گیت ${eTicketData.flight.departure.gate}` : ''})</div>
            <div class="info-item"><strong>تاریخ و زمان:</strong> ${departureDateTime.toLocaleDateString('fa-IR')} ${departureDateTime.toLocaleTimeString('fa-IR')}</div>
          </div>

          <div class="section-title">اطلاعات مقصد</div>
          <div class="info-grid">
            <div class="info-item"><strong>شهر:</strong> ${eTicketData.flight.arrival.city.fa}</div>
            <div class="info-item"><strong>فرودگاه:</strong> ${eTicketData.flight.arrival.airport.fa} (${eTicketData.flight.arrival.terminal ? `ترمینال ${eTicketData.flight.arrival.terminal}` : ''}${eTicketData.flight.arrival.gate ? `, گیت ${eTicketData.flight.arrival.gate}` : ''})</div>
            <div class="info-item"><strong>تاریخ و زمان:</strong> ${arrivalDateTime.toLocaleDateString('fa-IR')} ${arrivalDateTime.toLocaleTimeString('fa-IR')}</div>
          </div>

          <div class="section-title">اطلاعات مسافران</div>
          <div class="passenger-list">
            ${eTicketData.passengers.map(p => `
              <div class="passenger-card">
                <h4>${p.name}</h4>
                <p><strong>شماره صندلی:</strong> ${p.seatNumber}</p>
                <p><strong>شماره بلیط:</strong> ${p.ticketNumber}</p>
              </div>
            `).join('')}
          </div>

          <div class="info-item"><strong>مجاز حمل بار:</strong> ${eTicketData.baggageAllowance}</div>

          <div class="footer">
            <p>با آرزوی پروازی دلپذیر برای شما</p>
            <p>&copy; ${new Date().getFullYear()} Trevel. کلیه حقوق محفوظ است.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();
    return pdfBuffer;
  }
}
