import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlightsService } from '../flights/flights.service';
import { AccountingService } from '../accounting/accounting.service';
import { AccountingSetupService } from '../accounting/accounting-setup.service';
import { UpdateUserDto, CreateFlightDto, UpdateFlightDto } from '../common/dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, BookingStatus, TicketStatus, TransactionType, AccountType, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

interface LogEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService, 
    private flightsService: FlightsService, 
    private configService: ConfigService,
    private accountingService: AccountingService,
    private accountingSetup: AccountingSetupService
  ) {}

  async cancelPastFlights() {
    try {
      const now = new Date();
      
      const pastFlights = await this.prisma.flight.findMany({
        where: {
          status: 'ON_TIME',
          departureTime: {
            lt: now
          }
        }
      });

      const results = [];

      for (const flight of pastFlights) {
        // Update flight status to CANCELLED
        const updatedFlight = await this.prisma.flight.update({
          where: { id: flight.id },
          data: { 
            status: 'CANCELLED',
            updatedAt: now
          }
        });

        // Cancel all related bookings
        const relatedBookings = await this.prisma.booking.findMany({
          where: {
            flightId: flight.id,
            status: {
              in: ['CONFIRMED', 'PENDING']
            }
          }
        });

        let cancelledBookings = 0;
        if (relatedBookings.length > 0) {
          const bookingUpdate = await this.prisma.booking.updateMany({
            where: {
              flightId: flight.id,
              status: {
                in: ['CONFIRMED', 'PENDING']
              }
            },
            data: {
              status: 'CANCELLED'
            }
          });
          cancelledBookings = bookingUpdate.count;
        }

        results.push({
          flightId: flight.id,
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          cancelledBookings: cancelledBookings
        });
      }

      return {
        success: true,
        message: `${results.length} past flights cancelled successfully`,
        cancelledFlights: results
      };
    } catch (error) {
      console.error('Error cancelling past flights:', error);
      throw new BadRequestException('Failed to cancel past flights');
    }
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalBookings = await this.prisma.booking.count();
    
    // Total Revenue from confirmed bookings
    const totalRevenue = await this.prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: BookingStatus.CONFIRMED },
    });

    // Calculate Net Profit from accounting system
    let netProfit = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    try {
      console.log('🔍 Fetching financial data from database...');
      
      // Get all revenue transactions (Ticket Sales Revenue - Account 4011)
      const revenueTransactions = await this.prisma.transaction.findMany({
        where: {
          accountId: '4011', // Ticket Sales Revenue
        },
        select: {
          credit: true,
          debit: true,
        },
      });

      console.log(`📈 Found ${revenueTransactions.length} revenue transactions`);

      // Calculate total income from revenue account
      totalIncome = revenueTransactions.reduce((sum, transaction) => {
        return sum + Number(transaction.credit || 0);
      }, 0);

      // Get all expense transactions (you can add more expense accounts as needed)
      const expenseTransactions = await this.prisma.transaction.findMany({
        where: {
          account: {
            type: 'EXPENSE',
          },
        },
        select: {
          debit: true,
          credit: true,
        },
      });

      console.log(`📉 Found ${expenseTransactions.length} expense transactions`);

      // Calculate total expenses
      totalExpenses = expenseTransactions.reduce((sum, transaction) => {
        return sum + Number(transaction.debit || 0);
      }, 0);

      // Calculate net profit
      netProfit = totalIncome - totalExpenses;

      console.log(`📊 Financial Stats - Total Income: ${totalIncome}, Total Expenses: ${totalExpenses}, Net Profit: ${netProfit}`);
    } catch (error) {
      console.error('❌ Error calculating financial stats:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback to booking revenue if accounting system fails
      totalIncome = totalRevenue._sum.totalPrice ? Number(totalRevenue._sum.totalPrice) : 0;
      netProfit = totalIncome; // Assume no expenses for now
      console.log(`🔄 Fallback - Total Income: ${totalIncome}, Net Profit: ${netProfit}`);
    }

    // Fix: Count upcoming flights correctly (departure time > now)
    const now = new Date();
    const upcomingFlights = await this.prisma.flight.count({ 
      where: { 
        departureTime: { gt: now },
        status: { in: ['ON_TIME', 'CLOSE', 'WAITING_FOR_COMMAND'] }
      } 
    });
    
    const activeFlights = await this.prisma.flight.count({ where: { status: 'ON_TIME' } });
    const pendingTickets = await this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } });

    // Last 5 recent bookings
    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { bookingDate: 'desc' },
      include: {
        user: { select: { name: true } },
        flight: {
          select: {
            flightNumber: true,
            departureAirport: { select: { city: true } },
            arrivalAirport: { select: { city: true } },
          },
        },
      },
    });

    // Revenue chart (last 4 months, mock data for now as date aggregation in Prisma is complex without raw queries)
    const revenueChart = [];
    for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthlyRevenue = await this.prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: {
                status: BookingStatus.CONFIRMED,
                bookingDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });
        revenueChart.push({
            month: startOfMonth.toLocaleString('fa-IR', { month: 'long' }), // Use 'fa-IR' for Persian month names
            revenue: monthlyRevenue._sum.totalPrice ? Number(monthlyRevenue._sum.totalPrice) : 0,
        });
    }

    return {
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice ? Number(totalRevenue._sum.totalPrice) : 0,
      totalIncome, // مجموع درآمد
      netProfit, // سود خالص
      totalExpenses, // مجموع هزینه‌ها
      upcomingFlights, // Use correct upcoming flights count
      activeFlights,
      pendingTickets,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        user: b.user?.name || 'Unknown',
        flight: `${b.flight.flightNumber} (${b.flight.departureAirport?.city || ''} - ${b.flight.arrivalAirport?.city || ''})`,
        amount: Number(b.totalPrice),
        date: b.bookingDate.toISOString(),
      })),
      revenueChart
    };
  }

  async getUsers(page: number, limit: number) {
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await this.prisma.user.findMany({
      skip,
      take: Number(limit),
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        tenantId: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const total = await this.prisma.user.count();

    return {
      users,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async createUser(data: any) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('نام کاربری یا ایمیل قبلاً استفاده شده است');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const defaultTenantId = this.configService.get<string>('DEFAULT_TENANT_ID') || 'clmey6sjo6d000fumywum4qyk'; // Get from config

    const newUser = await this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
        phone: data.phone,
        role: data.role as UserRole || UserRole.USER,
        status: data.status as UserStatus || UserStatus.ACTIVE,
        tenantId: data.tenantId || defaultTenantId,
      },
    });
    
    return {
      success: true,
      data: {
        user: newUser
      }
    };
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role as UserRole,
        status: data.status as UserStatus,
      },
    });
    return updatedUser;
  }

  async getBookings(page: number, status?: string) {
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = status ? { status: status as BookingStatus } : {};

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          flight: {
            select: {
              id: true,
              flightNumber: true,
              airline: true,
              flightClass: true,
              departureTime: true,
              arrivalTime: true,
              departureAirport: { 
                select: { 
                  city: true, 
                  iata: true, 
                  name: true 
                } 
              },
              arrivalAirport: { 
                select: { 
                  city: true, 
                  iata: true, 
                  name: true 
                } 
              },
            },
          },
          passengersInfo: {
            where: {
              bookingId: { not: null }
            }
          },
        },
        orderBy: { bookingDate: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateBooking(bookingId: string, bookingData: any) {
    console.log('🔍 Updating booking:', bookingId, bookingData);
    
    // Check if booking exists
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        flight: {
          select: {
            id: true,
            flightNumber: true,
            airline: true,
            flightClass: true,
            departureTime: true,
            arrivalTime: true,
            departureAirport: { 
              select: { 
                city: true, 
                iata: true, 
                name: true 
              } 
            },
            arrivalAirport: { 
              select: { 
                city: true, 
                iata: true, 
                name: true 
              } 
            },
          },
        },
        passengersInfo: {
          where: {
            bookingId: { not: null }
          }
        },
      },
    });

    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Update booking with provided data
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: bookingData.status || existingBooking.status,
        notes: bookingData.notes || existingBooking.notes,
        totalPrice: bookingData.totalPrice ? Number(bookingData.totalPrice) : existingBooking.totalPrice,
        contactEmail: bookingData.contactEmail || existingBooking.contactEmail,
        contactPhone: bookingData.contactPhone || existingBooking.contactPhone,
        passengersData: bookingData.passengersData ? JSON.stringify(bookingData.passengersData) : existingBooking.passengersData,
        source: bookingData.source || existingBooking.source,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        flight: {
          select: {
            id: true,
            flightNumber: true,
            airline: true,
            flightClass: true,
            departureTime: true,
            arrivalTime: true,
            departureAirport: { 
              select: { 
                city: true, 
                iata: true, 
                name: true 
              } 
            },
            arrivalAirport: { 
              select: { 
                city: true, 
                iata: true, 
                name: true 
              } 
            },
          },
        },
        passengersInfo: {
          where: {
            bookingId: { not: null }
          }
        },
      },
    });

    console.log('✅ Booking updated successfully:', updatedBooking.id);
    return updatedBooking;
  }

  async fixBookingSources() {
    console.log('🔍 Fixing booking sources...');
    
    try {
      // Find bookings that should be Charter118 based on flight ID patterns
      const charter118Bookings = await this.prisma.booking.findMany({
        where: {
          OR: [
            { flightId: { startsWith: 'charter118-' } },
            { flightId: { startsWith: 'C118-' } },
            { notes: { contains: 'Charter118' } },
            { notes: { contains: 'C118-' } }
          ],
          source: { not: 'charter118' }
        }
      });

      console.log(`🔍 Found ${charter118Bookings.length} bookings to fix for Charter118`);

      for (const booking of charter118Bookings) {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: {
            source: 'charter118',
            notes: booking.notes || `Charter118 Booking ID: ${booking.id}, Confirmation Code: C118-${booking.id.slice(-8).toUpperCase()}`
          }
        });
        console.log(`✅ Fixed booking ${booking.id} to Charter118`);
      }

      // Find bookings that should be Sepehr based on flight ID patterns
      const sepehrBookings = await this.prisma.booking.findMany({
        where: {
          OR: [
            { flightId: { startsWith: 'sepehr-' } },
            { flightId: { startsWith: 'SP-' } },
            { notes: { contains: 'Sepehr' } },
            { notes: { contains: 'SPAES' } }
          ],
          source: { not: 'sepehr' }
        }
      });

      console.log(`🔍 Found ${sepehrBookings.length} bookings to fix for Sepehr`);

      for (const booking of sepehrBookings) {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: {
            source: 'sepehr',
            notes: booking.notes || `Sepehr Booking ID: ${booking.id}, PNR: SPAES${booking.id.slice(-6).toUpperCase()}`
          }
        });
        console.log(`✅ Fixed booking ${booking.id} to Sepehr`);
      }

      return {
        success: true,
        message: `Fixed ${charter118Bookings.length} Charter118 bookings and ${sepehrBookings.length} Sepehr bookings`,
        charter118Fixed: charter118Bookings.length,
        sepehrFixed: sepehrBookings.length
      };
    } catch (error: any) {
      console.error('❌ Error fixing booking sources:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fix booking sources'
      };
    }
  }

  async forceUpdateBookingSource(bookingId: string, source: string) {
    console.log(`🔍 Force updating booking ${bookingId} source to ${source}`);
    
    try {
      const updatedBooking = await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          source: source,
          notes: source === 'charter118' ? 
            `Charter118 Booking ID: C118-BOOK-${bookingId.slice(-8)}, Confirmation Code: C118-${bookingId.slice(-8).toUpperCase()}` :
            source === 'sepehr' ?
            `Sepehr Booking ID: SP-BOOK-${bookingId.slice(-8)}, PNR: SPAES${bookingId.slice(-6).toUpperCase()}` :
            'Updated by admin'
        }
      });

      console.log(`✅ Booking ${bookingId} source updated to ${source}`);
      return {
        success: true,
        message: `Booking ${bookingId} source updated to ${source}`,
        booking: updatedBooking
      };
    } catch (error: any) {
      console.error(`❌ Error updating booking ${bookingId}:`, error);
      return {
        success: false,
        error: error.message,
        message: `Failed to update booking ${bookingId}`
      };
    }
  }

  async getFlights() {
    try {
      const flights = await this.prisma.flight.findMany({
        where: {
          source: 'manual' // Only show manually created flights
        },
        include: {
          departureAirport: true,
          arrivalAirport: true,
          allotments: {
            include: {
              agent: { select: { id: true, name: true, email: true } }
            }
          },
          airlineInfo: true,
          commissionModel: true,
          refundPolicy: true,
          creator: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform to match frontend expectations and update status based on time
      const now = new Date();
      return flights.map(flight => {
        // Determine actual status based on departure time
        let actualStatus = flight.status;
        if (flight.departureTime < now && ['ON_TIME', 'CLOSE', 'WAITING_FOR_COMMAND'].includes(flight.status)) {
          actualStatus = 'CANCELLED'; // Mark as cancelled for display
        }

        return {
          ...flight,
          status: actualStatus, // Use actual status
          departure: {
            airportCode: flight.departureAirport?.iata || '',
            airportName: flight.departureAirport?.name ? (typeof flight.departureAirport.name === 'string' ? JSON.parse(flight.departureAirport.name).fa : flight.departureAirport.name) : '',
            city: flight.departureAirport?.city ? (typeof flight.departureAirport.city === 'string' ? JSON.parse(flight.departureAirport.city).fa : flight.departureAirport.city) : '',
            dateTime: flight.departureTime.toISOString(),
          },
          arrival: {
            airportCode: flight.arrivalAirport?.iata || '',
            airportName: flight.arrivalAirport?.name ? (typeof flight.arrivalAirport.name === 'string' ? JSON.parse(flight.arrivalAirport.name).fa : flight.arrivalAirport.name) : '',
            city: flight.arrivalAirport?.city ? (typeof flight.arrivalAirport.city === 'string' ? JSON.parse(flight.arrivalAirport.city).fa : flight.arrivalAirport.city) : '',
            dateTime: flight.arrivalTime.toISOString(),
          },
          duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
          airlineLogoUrl: flight.airlineLogoUrl || flight.airlineInfo?.logoUrl || '',
        };
      });
    } catch (error) {
      console.error('Error fetching flights:', error);
      // Fallback: return basic flights
      const basicFlights = await this.prisma.flight.findMany({
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return basicFlights.map(flight => ({
        ...flight,
        departure: {
          airportCode: flight.departureAirport?.iata || '',
          airportName: flight.departureAirport?.name ? (typeof flight.departureAirport.name === 'string' ? JSON.parse(flight.departureAirport.name).fa : flight.departureAirport.name) : '',
          city: flight.departureAirport?.city ? (typeof flight.departureAirport.city === 'string' ? JSON.parse(flight.departureAirport.city).fa : flight.departureAirport.city) : '',
          dateTime: flight.departureTime.toISOString(),
        },
        arrival: {
          airportCode: flight.arrivalAirport?.iata || '',
          airportName: flight.arrivalAirport?.name ? (typeof flight.arrivalAirport.name === 'string' ? JSON.parse(flight.arrivalAirport.name).fa : flight.arrivalAirport.name) : '',
          city: flight.arrivalAirport?.city ? (typeof flight.arrivalAirport.city === 'string' ? JSON.parse(flight.arrivalAirport.city).fa : flight.arrivalAirport.city) : '',
          dateTime: flight.arrivalTime.toISOString(),
        },
        duration: `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`,
        airlineLogoUrl: flight.airlineLogoUrl || '',
      }));
    }
  }

  async createFlight(creatorId: string, createFlightDto: CreateFlightDto) {
    return this.flightsService.createFlight(createFlightDto);
  }

  async updateFlight(flightId: string, updateFlightDto: UpdateFlightDto) {
    return this.flightsService.updateFlight(flightId, updateFlightDto);
  }

  async deleteFlight(flightId: string) {
    return this.flightsService.deleteFlight(flightId);
  }

  async toggleFlightStatus(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new UnauthorizedException('پرواز یافت نشد');
    }

    // Cycle through the 6 statuses
    const statusCycle = ['ON_TIME', 'CLOSE', 'WAITING_FOR_COMMAND', 'NO_AVAILABILITY', 'CALL_US', 'CANCELLED'];
    const currentIndex = statusCycle.indexOf(flight.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];

    return this.prisma.flight.update({
      where: { id: flightId },
      data: { status: newStatus as any },
    });
  }

  async getAllFlights() {
    try {
      const flights = await this.prisma.flight.findMany();
      console.log('Flights found:', flights.length);
      return flights;
    } catch (error) {
      console.error('Error in getAllFlights:', error);
      throw error;
    }
  }

  async getAllTickets(status?: string) {
    const where: any = status ? { status: status as TicketStatus } : {};

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: {
          select: {
            id: true,
            flight: { select: { flightNumber: true } },
          },
        },
        messages: {
          orderBy: { timestamp: 'asc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      bookingId: ticket.bookingId,
      user: ticket.user,
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        author: msg.authorType as 'USER' | 'ADMIN',
        authorName: msg.authorType === 'USER' ? ticket.user?.name || ticket.user?.email : 'پشتیبانی',
        text: msg.text,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const validStatus = status as TicketStatus;
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: validStatus },
    });
    return { success: true, message: `وضعیت تیکت به ${status} تغییر یافت` };
  }

  async adminReplyToTicket(adminId: string, ticketId: string, message: string, sendChannels: any) {
    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        messages: {
          create: {
            authorId: adminId,
            authorType: 'ADMIN',
            text: message,
          },
        },
        status: 'RESPONDED', // Admin replies, status becomes "responded"
      },
      include: {
        user: true,
        messages: true,
      },
    });

    // TODO: Implement actual notification sending (email, SMS, WhatsApp)
    const notifications = [];
    if (sendChannels.email) notifications.push('ایمیل');
    if (sendChannels.sms) notifications.push('پیامک');
    if (sendChannels.whatsapp) notifications.push('واتس‌آپ');

    // Format the ticket data to match frontend expectations
    const formattedTicket = {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      bookingId: ticket.bookingId,
      user: ticket.user,
      messages: ticket.messages.map(msg => ({
        id: msg.id,
        author: msg.authorType as 'USER' | 'ADMIN',
        authorName: msg.authorType === 'USER' ? ticket.user?.name || ticket.user?.username : 'پشتیبانی',
        text: msg.text,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    return {
      success: true,
      data: formattedTicket, // Return the complete updated ticket
      message: ticket.messages[ticket.messages.length - 1], // Return the new message
      notifications: notifications.length > 0 ? `پیام از طریق ${notifications.join(', ')} ارسال شد` : 'پیام ثبت شد',
      ticketStatus: ticket.status,
    };
  }

  async getBasicData(type: string) {
    switch (type) {
      case 'airline':
        const airlines = await this.prisma.airline.findMany();
        return airlines.map(airline => ({
          ...airline,
          name: typeof airline.name === 'string' ? JSON.parse(airline.name) : airline.name,
        }));
      case 'aircraft':
        const aircrafts = await this.prisma.aircraft.findMany();
        return aircrafts.map(aircraft => ({
          ...aircraft,
          name: typeof aircraft.name === 'string' ? JSON.parse(aircraft.name) : aircraft.name,
        }));
      case 'airport':
        const airports = await this.prisma.airport.findMany();
        return airports.map(airport => ({
          ...airport,
          name: typeof airport.name === 'string' ? JSON.parse(airport.name) : airport.name,
          city: typeof airport.city === 'string' ? JSON.parse(airport.city) : airport.city,
          country: typeof airport.country === 'string' ? JSON.parse(airport.country) : airport.country,
        }));
      case 'country':
        const countries = await this.prisma.country.findMany();
        return countries.map(country => ({
          ...country,
          name: typeof country.name === 'string' && country.name.startsWith('{') ? JSON.parse(country.name) : country.name,
        }));
      case 'flightClass':
        const flightClasses = await this.prisma.flightClass.findMany();
        return flightClasses.map(flightClass => ({
          ...flightClass,
          name: typeof flightClass.name === 'string' ? JSON.parse(flightClass.name) : flightClass.name,
        }));
      case 'currency':
        const currencies = await this.prisma.currency.findMany();
        return currencies.map(currency => ({
          ...currency,
          name: typeof currency.name === 'string' ? JSON.parse(currency.name) : currency.name,
          symbol: typeof currency.symbol === 'string' ? JSON.parse(currency.symbol) : currency.symbol,
        }));
      case 'refundPolicy':
        const refundPolicies = await this.prisma.refundPolicy.findMany();
        return refundPolicies.map(policy => ({
          ...policy,
          name: typeof policy.name === 'string' ? JSON.parse(policy.name) : policy.name,
        }));
      case 'commissionModel':
        const commissionModels = await this.prisma.commissionModel.findMany();
        return commissionModels.map(model => ({
          ...model,
          name: typeof model.name === 'string' ? JSON.parse(model.name) : model.name,
        }));
      default:
        throw new UnauthorizedException('نوع داده پایه نامعتبر است');
    }
  }

  async createBasicData(type: string, data: any) {
    try {
      switch (type) {
        case 'airline':
          // Convert name object to JSON string if it's an object
          const airlineData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.airline.create({ data: airlineData });
        case 'aircraft':
          // Convert name object to JSON string if it's an object
          const aircraftData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.aircraft.create({ data: aircraftData });
        case 'airport':
          // Convert name object to JSON string if it's an object
          const airportData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            city: typeof data.city === 'object' ? JSON.stringify(data.city) : data.city,
            country: typeof data.country === 'object' ? JSON.stringify(data.country) : data.country
          };
          return this.prisma.airport.create({ data: airportData });
        case 'country':
          // Convert name object to JSON string if it's an object
          const countryData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.country.create({ data: countryData });
        case 'flightClass':
          // Convert name object to JSON string if it's an object
          const flightClassData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.flightClass.create({ data: flightClassData });
        case 'commissionModel':
          // Convert name object to JSON string if it's an object
          const commissionModelData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.commissionModel.create({ data: commissionModelData });
        case 'currency':
          // Convert name and symbol objects to JSON strings if they're objects
          const currencyData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            symbol: typeof data.symbol === 'object' ? JSON.stringify(data.symbol) : data.symbol,
            exchangeRateToUSD: data.exchangeRateToUSD || 1.0 // Default to 1.0 if not provided
          };
          return this.prisma.currency.create({ data: currencyData });
        case 'refundPolicy':
          // Convert name and rules objects to JSON strings if they're objects
          const refundPolicyData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            rules: typeof data.rules === 'object' ? JSON.stringify(data.rules) : data.rules
          };
          return this.prisma.refundPolicy.create({ data: refundPolicyData });
        default:
          throw new UnauthorizedException('نوع داده پایه نامعتبر است');
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      throw new BadRequestException(`خطا در ایجاد ${type}: ${(error as any).message}`);
    }
  }

  async updateBasicData(type: string, id: string, data: any) {
    try {
      switch (type) {
        case 'airline':
          // Convert name object to JSON string if it's an object
          const airlineData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.airline.update({ where: { id }, data: airlineData });
        case 'aircraft':
          // Convert name object to JSON string if it's an object
          const aircraftData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.aircraft.update({ where: { id }, data: aircraftData });
        case 'airport':
          // Convert name object to JSON string if it's an object
          const airportData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            city: typeof data.city === 'object' ? JSON.stringify(data.city) : data.city,
            country: typeof data.country === 'object' ? JSON.stringify(data.country) : data.country
          };
          return this.prisma.airport.update({ where: { id }, data: airportData });
        case 'country':
          // Convert name object to JSON string if it's an object
          const countryData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.country.update({ where: { id }, data: countryData });
        case 'flightClass':
          // Convert name object to JSON string if it's an object
          const flightClassData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.flightClass.update({ where: { id }, data: flightClassData });
        case 'commissionModel':
          // Convert name object to JSON string if it's an object
          const commissionModelData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name
          };
          return this.prisma.commissionModel.update({ where: { id }, data: commissionModelData });
        case 'currency':
          // Convert name and symbol objects to JSON strings if they're objects
          const currencyData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            symbol: typeof data.symbol === 'object' ? JSON.stringify(data.symbol) : data.symbol,
            exchangeRateToUSD: data.exchangeRateToUSD || 1.0 // Default to 1.0 if not provided
          };
          return this.prisma.currency.update({ where: { id }, data: currencyData });
        case 'refundPolicy':
          // Convert name and rules objects to JSON strings if they're objects
          const refundPolicyData = {
            ...data,
            name: typeof data.name === 'object' ? JSON.stringify(data.name) : data.name,
            rules: typeof data.rules === 'object' ? JSON.stringify(data.rules) : data.rules
          };
          return this.prisma.refundPolicy.update({ where: { id }, data: refundPolicyData });
        default:
          throw new UnauthorizedException('نوع داده پایه نامعتبر است');
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      throw new BadRequestException(`خطا در به‌روزرسانی ${type}: ${(error as any).message}`);
    }
  }

  async deleteBasicData(type: string, id: string) {
    switch (type) {
      case 'airline':
        return this.prisma.airline.delete({ where: { id } });
      case 'aircraft':
        return this.prisma.aircraft.delete({ where: { id } });
      case 'airport':
        return this.prisma.airport.delete({ where: { id } });
      case 'country':
        return this.prisma.country.delete({ where: { id } });
      case 'flightClass':
        return this.prisma.flightClass.delete({ where: { id } });
      case 'commissionModel':
        return this.prisma.commissionModel.delete({ where: { id } });
      case 'currency':
        return this.prisma.currency.delete({ where: { id } });
      case 'refundPolicy':
        return this.prisma.refundPolicy.delete({ where: { id } });
      default:
        throw new UnauthorizedException('نوع داده پایه نامعتبر است');
    }
  }

  async chargeUserWallet(userId: string, amount: number, currency: string, description: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    // Find or create wallet for this specific currency
    let wallet = await this.prisma.wallet.findFirst({
      where: { 
        userId: user.id,
        currency: currency
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: BigInt(0),
          currency,
        },
      });
    }

    // SENIOR FIX: Ensure amount is a valid number and convert to BigInt safely
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('مبلغ نامعتبر');
    }
    
    const currentBalance = wallet.balance;
    const newBalance = currentBalance + BigInt(numericAmount);
    
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    await this.prisma.walletTransaction.create({
      data: {
        userId: userId,
        amount: BigInt(numericAmount),
        type: TransactionType.CREDIT,
        description,
        currency,
      },
    });

    // Create accounting entry for wallet charging
    try {
      await this.accountingService.createWalletChargeEntry(userId, numericAmount, description);
      console.log(`✅ Accounting entry created for wallet charge: ${numericAmount} ${currency}`);
    } catch (accountingError) {
      console.error('❌ Failed to create accounting entry for wallet charge:', accountingError);
      // Don't throw error - wallet charge succeeded, accounting is secondary
    }

    return { success: true, message: `کیف پول کاربر شارژ شد: ${amount} ${currency}` };
  }

  async resetUserPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { success: true, message: 'رمز عبور کاربر تغییر یافت' };
  }

  async getActivityLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [recentBookings, recentTickets, totalBookings, totalTickets] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        take: limit,
        skip,
        orderBy: { bookingDate: 'desc' },
        select: {
          id: true,
          user: { select: { name: true } },
          bookingDate: true,
        },
      }),
      this.prisma.ticket.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          user: { select: { name: true } },
          createdAt: true,
          subject: true,
        },
      }),
      this.prisma.booking.count(),
      this.prisma.ticket.count(),
    ]);

    const logs: LogEntry[] = [];

    recentBookings.forEach(booking => {
      logs.push({
        id: booking.id,
        user: booking.user?.name || 'Unknown User',
        action: `رزرو جدید انجام شد (ID: ${booking.id})`,
        timestamp: booking.bookingDate.toISOString(),
      });
    });

    recentTickets.forEach(ticket => {
      logs.push({
        id: ticket.id,
        user: ticket.user?.name || 'Unknown User',
        action: `تیکت پشتیبانی جدید (موضوع: ${ticket.subject})`,
        timestamp: ticket.createdAt.toISOString(),
      });
    });

    // Sort logs by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = totalBookings + totalTickets;

    return {
      logs: logs.slice(0, limit), // Ensure we only return 'limit' number of logs
      total,
      page,
      limit
    };
  }

  async getTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommissionStats(tenantId: string) {
    const stats = await this.prisma.commissionTransaction.aggregate({
      where: { tenantId },
      _sum: {
        agentAmount: true,
        parentAmount: true,
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const pendingStats = await this.prisma.commissionTransaction.aggregate({
      where: { 
        tenantId,
        status: 'PENDING'
      },
      _sum: {
        agentAmount: true
      },
      _count: {
        id: true
      }
    });

    const paidStats = await this.prisma.commissionTransaction.aggregate({
      where: { 
        tenantId,
        status: 'PAID'
      },
      _sum: {
        agentAmount: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalCommission: Number(stats._sum.agentAmount || 0),
      pendingCommission: Number(pendingStats._sum.agentAmount || 0),
      paidCommission: Number(paidStats._sum.agentAmount || 0),
      totalTransactions: stats._count.id,
      pendingTransactions: pendingStats._count.id,
      paidTransactions: paidStats._count.id
    };
  }

  async createTenant(data: any) {
    return this.prisma.tenant.create({
      data,
    });
  }

  async updateTenant(tenantId: string, data: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async getPermissions() {
    const rolePermissions = await this.prisma.rolePermissions.findUnique({
      where: { id: 'role_permissions' },
    });
    
    // Default permissions for each role
    const defaultPermissions = {
      SUPER_ADMIN: [
        'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'DELETE_FLIGHTS',
        'MANAGE_BOOKINGS', 'MANAGE_REFUNDS', 'MANAGE_TICKETS', 'MANAGE_USERS',
        'EDIT_USER_ROLE', 'MANAGE_BASIC_DATA', 'MANAGE_COMMISSION_MODELS',
        'VIEW_ACTIVITY_LOG', 'MANAGE_ACCOUNTING', 'MANAGE_RATE_LIMITS',
        'MANAGE_CONTENT', 'MANAGE_ADS', 'MANAGE_TENANTS', 'MANAGE_TELEGRAM_BOT',
        'MANAGE_WHATSAPP_BOT'
      ],
      ADMIN: [
        'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'DELETE_FLIGHTS',
        'MANAGE_BOOKINGS', 'MANAGE_REFUNDS', 'MANAGE_TICKETS', 'MANAGE_USERS',
        'MANAGE_BASIC_DATA', 'MANAGE_COMMISSION_MODELS', 'VIEW_ACTIVITY_LOG',
        'MANAGE_ACCOUNTING', 'MANAGE_RATE_LIMITS'
      ],
      EDITOR: [
        'VIEW_STATS', 'CREATE_FLIGHTS', 'EDIT_FLIGHTS', 'MANAGE_BOOKINGS',
        'MANAGE_TICKETS', 'MANAGE_BASIC_DATA'
      ],
      SUPPORT: [
        'VIEW_STATS', 'MANAGE_TICKETS', 'MANAGE_REFUNDS'
      ],
      AFFILIATE: [
        'VIEW_STATS', 'CREATE_OWN_FLIGHTS', 'EDIT_OWN_FLIGHTS', 'DELETE_OWN_FLIGHTS',
        'VIEW_OWN_BOOKINGS', 'VIEW_OWN_ACCOUNTING'
      ],
      ACCOUNTANT: [
        'VIEW_STATS', 'MANAGE_ACCOUNTING', 'VIEW_ACTIVITY_LOG'
      ],
      USER: []
    };
    
    return rolePermissions ? JSON.parse(rolePermissions.permissions) : defaultPermissions;
  }

  async updatePermissions(permissions: any) {
    const existingPermissions = await this.prisma.rolePermissions.findUnique({
      where: { id: 'role_permissions' },
    });

    if (existingPermissions) {
      await this.prisma.rolePermissions.update({
        where: { id: 'role_permissions' },
        data: { permissions },
      });
    } else {
      await this.prisma.rolePermissions.create({
        data: {
          id: 'role_permissions',
          permissions,
        },
      });
    }
    return { success: true, message: 'مجوزها به‌روزرسانی شد' };
  }

  async getAdvertisements() {
    return this.prisma.advertisement.findMany();
  }

  async createAdvertisement(data: any) {
    return this.prisma.advertisement.create({ data });
  }

  async updateAdvertisement(id: string, data: any) {
    return this.prisma.advertisement.update({ where: { id }, data });
  }

  async deleteAdvertisement(id: string) {
    await this.prisma.advertisement.delete({ where: { id } });
    return { success: true, message: 'تبلیغ حذف شد' };
  }

  async getContent() {
    const content = await this.prisma.siteContent.findFirst();
    if (!content) {
      return {
        home: { title: 'خانه', heroImageUrl: '/hero.jpg' },
        about: { title: 'درباره ما', body: 'متن درباره ما' },
        contact: { title: 'تماس', phone: '+98 21 1234 5678' }
      };
    }
    return JSON.parse(content.content);
  }

  async updateContent(data: any) {
    const existingContent = await this.prisma.siteContent.findFirst();
    if (existingContent) {
      await this.prisma.siteContent.update({
        where: { id: existingContent.id },
        data: { content: JSON.stringify(data) },
      });
    } else {
      await this.prisma.siteContent.create({
        data: { section: 'homepage', content: JSON.stringify(data) },
      });
    }
    return { success: true, message: 'محتوای سایت به‌روزرسانی شد' };
  }

  async createManualBooking(data: any) {
    const { userId, flightId, passengers, ...bookingData } = data;

    const newBooking = await this.prisma.booking.create({
      data: {
        ...bookingData,
        user: { connect: { id: userId } },
        flight: { connect: { id: flightId } },
        passengersInfo: {
          create: passengers.map((p: any) => ({ ...p, type: p.type || 'ADULT' })),
        },
        bookingDate: new Date(),
        status: BookingStatus.CONFIRMED,
      },
      include: { passengersInfo: true },
    });

    return {
      success: true,
      booking: newBooking,
      message: 'رزرو دستی با موفقیت ایجاد شد'
    };
  }

  async getFlightSalesReport(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        bookings: {
          include: {
            passengersInfo: true,
          },
        },
      },
    });

    if (!flight) {
      throw new UnauthorizedException('پرواز یافت نشد');
    }

    const totalBookedSeats = flight.bookings.reduce((sum: number, booking: any) => sum + booking.passengersInfo.length, 0);
    const totalRevenue = flight.bookings.reduce((sum: number, booking: any) => sum + Number(booking.totalPrice || 0), 0);

    return {
      flight,
      totalBookedSeats,
      totalRevenue,
      availableSeats: flight.availableSeats,
      utilizationRate: (totalBookedSeats / (flight.totalCapacity || 1)) * 100,
    };
  }

  async getFlightCapacityReport(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        bookings: {
          include: {
            passengersInfo: true,
          },
        },
        allotments: true,
      },
    });

    if (!flight) {
      throw new UnauthorizedException('پرواز یافت نشد');
    }

    const soldSeats = flight.bookings.reduce((sum: number, booking: any) => sum + booking.passengersInfo.length, 0);

    return {
      flightId,
      totalCapacity: flight.totalCapacity || 0,
      salesCapacity: (flight.totalCapacity || 0) - flight.allotments.reduce((sum: number, allotment: any) => sum + allotment.seats, 0),
      soldSeats,
      remainingCapacity: (flight.totalCapacity || 0) - soldSeats,
      utilizationRate: (soldSeats / (flight.totalCapacity || 1)) * 100,
    };
  }

  async getCommissionModels() {
    return this.prisma.commissionModel.findMany();
  }

  async createCommissionModel(data: any) {
    return this.prisma.commissionModel.create({ data });
  }

  async updateCommissionModel(id: string, data: any) {
    return this.prisma.commissionModel.update({ where: { id }, data });
  }

  async deleteCommissionModel(id: string) {
    await this.prisma.commissionModel.delete({ where: { id } });
    return { success: true, message: 'سیاست استرداد حذف شد' };
  }

  async getRateLimits() {
    return this.prisma.rateLimit.findMany();
  }

  async createRateLimit(data: any) {
    return this.prisma.rateLimit.create({ data });
  }

  async updateRateLimit(id: string, data: any) {
    return this.prisma.rateLimit.update({ where: { id }, data });
  }

  async deleteRateLimit(id: string) {
    return this.prisma.rateLimit.delete({ where: { id } });
  }

  async getRefundPolicies() {
    return this.prisma.refundPolicy.findMany({
      include: {},
    });
  }

  async createRefundPolicy(data: any) {
    const { rules, ...rest } = data;
    return this.prisma.refundPolicy.create({
      data: {
        ...rest,
        rules: {
          create: rules,
        },
      },
      include: {},
    });
  }

  async updateRefundPolicy(id: string, data: any) {
    const { rules, ...rest } = data;
    return this.prisma.refundPolicy.update({
      where: { id },
      data: {
        ...rest,
        ...(rules && {
          rules: {
            deleteMany: {},
            create: rules,
          },
        }),
      },
      include: {},
    });
  }

  async deleteRefundPolicy(id: string) {
    await this.prisma.refundPolicy.delete({
      where: { id },
    });
    return { success: true, message: 'سیاست استرداد حذف شد' };
  }

  async getFlightAllotments(flightId: string) {
    return this.prisma.seatAllotment.findMany({
      where: { flightId },
      include: {
        agent: true,
      },
    });
  }

  async createAllotment(flightId: string, data: { agentId: string; seats: number; expiresAt: string }) {
    return this.prisma.seatAllotment.create({
      data: {
        flight: { connect: { id: flightId } },
        agent: { connect: { id: data.agentId } },
        seats: data.seats,
        expiresAt: new Date(data.expiresAt),
      },
    });
  }

  async deleteAllotment(flightId: string, allotmentId: string) {
    await this.prisma.seatAllotment.delete({
      where: { id: allotmentId, flightId },
    });
    return { message: 'تخصیص صندلی حذف شد' };
  }

  // Refunds methods
  async getRefunds(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.refund.findMany({
      where,
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            flight: {
              select: {
                flightNumber: true,
                departureAirport: { select: { iata: true, city: true } },
                arrivalAirport: { select: { iata: true, city: true } },
              },
            },
          },
        },
      },
      orderBy: { requestDate: 'desc' },
    });
  }

  async updateRefund(refundId: string, action: string, reason?: string) {
    return this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: action,
        ...(reason && { adminNotes: reason }),
        processedAt: new Date(),
      },
    });
  }

  // Accounting methods
  async getExpenses(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };

    return this.prisma.expense.findMany({
      where,
      include: {
        account: true,
        recordedBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(data: any) {
    return this.prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        account: { connect: { id: data.accountId } },
        recordedBy: { connect: { id: data.recordedByUserId || data.userId } },
        date: new Date(data.date),
      },
      include: {
        account: true,
        recordedBy: { select: { name: true } },
      },
    });
  }

  async getChartOfAccounts() {
    return this.prisma.account.findMany({
      orderBy: [{ code: 'asc' }],
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async createAccount(data: any) {
    return this.prisma.account.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type as AccountType,
        ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
      },
    });
  }

  async updateAccount(accountId: string, data: any) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        code: data.code,
        name: data.name,
        type: data.type as AccountType,
        ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
      },
    });
  }

  // Integrations methods
  async getTelegramConfig() {
    // Mock Telegram config - replace with DB when ready
    return {
      isEnabled: false,
      botToken: '',
      chatId: '',
      notifyOn: {
        newBooking: true,
        bookingCancellation: true,
        refundUpdate: true,
        newUser: true,
        newTicket: true,
      }
    };
  }

  async updateTelegramConfig(config: any) {
    // Mock update - replace with DB when ready
    return {
      success: true,
      message: 'تنظیمات تلگرام با موفقیت به‌روزرسانی شد'
    };
  }

  async getWhatsAppConfig() {
    // Mock WhatsApp config - replace with DB when ready
    return {
      isEnabled: false,
      apiKey: '',
      phoneNumberId: '',
      notifyOn: {
        bookingSuccess: true,
        flightChange: true,
      }
    };
  }

  async updateWhatsAppConfig(config: any) {
    // Mock update - replace with DB when ready
    return {
      success: true,
      message: 'تنظیمات واتس‌اپ با موفقیت به‌روزرسانی شد'
    };
  }
}
