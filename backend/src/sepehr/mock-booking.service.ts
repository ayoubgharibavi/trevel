import { Injectable, Logger } from '@nestjs/common';

export interface MockBookingRequest {
  flightId: string;
  passengers: Array<{
    name: string;
    type: 'adult' | 'child' | 'infant';
  }>;
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface MockBookingResponse {
  id: string;
  confirmationCode: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  flight: {
    id: string;
    flightNumber: string;
    departure: {
      airportCode: string;
      airportName: string;
      city: string;
      dateTime: string;
    };
    arrival: {
      airportCode: string;
      airportName: string;
      city: string;
      dateTime: string;
    };
    airline: {
      code: string;
      name: string;
      logo: string;
    };
    aircraft: {
      code: string;
      name: string;
    };
    flightClass: {
      code: string;
      name: string;
    };
    price: {
      adult: number;
      child: number;
      infant: number;
      currency: string;
    };
    availableSeats: number;
    baggage: {
      weight: number;
      unit: string;
    };
    duration: number;
    stops: number;
  };
  passengers: Array<{
    id: string;
    name: string;
    type: 'adult' | 'child' | 'infant';
    seatNumber: string;
    ticketNumber: string;
  }>;
  contactInfo: {
    email: string;
    phone: string;
  };
  totalPrice: number;
  currency: string;
  bookingDate: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
}

@Injectable()
export class MockBookingService {
  private readonly logger = new Logger(MockBookingService.name);
  private bookings: Map<string, MockBookingResponse> = new Map();

  // Mock flight data
  private mockFlights = {
    'sepehr-123': {
      id: 'sepehr-123',
      flightNumber: 'IR1234',
      departure: {
        airportCode: 'IKA',
        airportName: 'فرودگاه امام خمینی',
        city: 'تهران',
        dateTime: new Date().toISOString(),
      },
      arrival: {
        airportCode: 'MHD',
        airportName: 'فرودگاه شهید هاشمی نژاد',
        city: 'مشهد',
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      airline: {
        code: 'IR',
        name: 'ایران ایر',
        logo: 'https://example.com/iranair-logo.png'
      },
      aircraft: {
        code: 'A320',
        name: 'ایرباس A320'
      },
      flightClass: {
        code: 'Y',
        name: 'اکونومی'
      },
      price: {
        adult: 1500000,
        child: 1200000,
        infant: 0,
        currency: 'IRR'
      },
      availableSeats: 120,
      baggage: {
        weight: 20,
        unit: 'kg'
      },
      duration: 120,
      stops: 0
    },
    'sepehr-456': {
      id: 'sepehr-456',
      flightNumber: 'IR5678',
      departure: {
        airportCode: 'MHD',
        airportName: 'فرودگاه شهید هاشمی نژاد',
        city: 'مشهد',
        dateTime: new Date().toISOString(),
      },
      arrival: {
        airportCode: 'IKA',
        airportName: 'فرودگاه امام خمینی',
        city: 'تهران',
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      airline: {
        code: 'IR',
        name: 'ایران ایر',
        logo: 'https://example.com/iranair-logo.png'
      },
      aircraft: {
        code: 'A320',
        name: 'ایرباس A320'
      },
      flightClass: {
        code: 'Y',
        name: 'اکونومی'
      },
      price: {
        adult: 1500000,
        child: 1200000,
        infant: 0,
        currency: 'IRR'
      },
      availableSeats: 120,
      baggage: {
        weight: 20,
        unit: 'kg'
      },
      duration: 120,
      stops: 0
    }
  };

  async createBooking(request: MockBookingRequest): Promise<MockBookingResponse> {
    this.logger.log(`🔍 Creating mock booking for flight: ${request.flightId}`);

    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const confirmationCode = `CONF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Simulate random success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    const mockFlight = this.getMockFlight(request.flightId);
    if (!mockFlight) {
      throw new Error('Flight not found');
    }

    if (!isSuccess) {
      throw new Error('Booking failed - service unavailable');
    }

    const booking: MockBookingResponse = {
      id: bookingId,
      confirmationCode,
      status: 'CONFIRMED',
      flight: mockFlight,
      passengers: request.passengers.map((passenger, index) => ({
        id: `passenger-${index + 1}`,
        name: passenger.name,
        type: passenger.type,
        seatNumber: `A${index + 1}`,
        ticketNumber: `TK${Date.now()}${index + 1}`
      })),
      contactInfo: request.contactInfo,
      totalPrice: request.passengers.reduce((total, passenger) => {
        const price = passenger.type === 'adult' ? mockFlight.price.adult :
                     passenger.type === 'child' ? mockFlight.price.child :
                     mockFlight.price.infant;
        return total + price;
      }, 0),
      currency: mockFlight.price.currency,
      bookingDate: new Date().toISOString(),
      paymentStatus: 'PENDING'
    };

    this.bookings.set(bookingId, booking);
    this.logger.log(`✅ Mock booking created: ${bookingId}`);
    
    return booking;
  }

  async getBooking(bookingId: string): Promise<MockBookingResponse | null> {
    this.logger.log(`🔍 Getting mock booking: ${bookingId}`);
    
    const booking = this.bookings.get(bookingId);
    if (booking) {
      this.logger.log(`✅ Mock booking found: ${bookingId}`);
      return booking;
    }
    
    this.logger.warn(`⚠️ Mock booking not found: ${bookingId}`);
    return null;
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    this.logger.log(`🔍 Cancelling mock booking: ${bookingId}`);
    
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      this.logger.warn(`⚠️ Mock booking not found for cancellation: ${bookingId}`);
      return false;
    }

    if (booking.status === 'CANCELLED') {
      this.logger.warn(`⚠️ Mock booking already cancelled: ${bookingId}`);
      return false;
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    this.bookings.set(bookingId, booking);
    
    this.logger.log(`✅ Mock booking cancelled: ${bookingId}`);
    return true;
  }

  async getAllBookings(): Promise<MockBookingResponse[]> {
    return Array.from(this.bookings.values());
  }

  private getMockFlight(flightId: string): any {
    return (this.mockFlights as any)[flightId] || null;
  }

  // Initialize with some sample bookings
  async initializeSampleBookings(): Promise<void> {
    this.logger.log('🔍 Initializing sample mock bookings...');
    
    const sampleRequests = [
      {
        flightId: 'sepehr-123',
        passengers: [
          { name: 'احمد محمدی', type: 'adult' as const },
          { name: 'فاطمه احمدی', type: 'adult' as const }
        ],
        contactInfo: {
          email: 'ahmad@example.com',
          phone: '09123456789'
        }
      },
      {
        flightId: 'sepehr-456',
        passengers: [
          { name: 'علی رضایی', type: 'adult' as const }
        ],
        contactInfo: {
          email: 'ali@example.com',
          phone: '09987654321'
        }
      }
    ];

    for (const request of sampleRequests) {
      try {
        await this.createBooking(request);
      } catch (error) {
        this.logger.error(`Failed to create sample booking: ${(error as Error).message}`);
      }
    }
  }
}