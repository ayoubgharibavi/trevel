import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SepehrFlightSearchRequest {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
}

export interface SepehrFlightSearchResponse {
  success: boolean;
  data: {
    flights: SepehrFlight[];
    totalCount: number;
    searchId: string;
  };
  message: string;
}

export interface SepehrFlight {
  id: string;
  flightNumber: string;
  airline: {
    code: string;
    name: { fa: string; en: string };
    logo: string;
  };
  aircraft: {
    code: string;
    name: { fa: string; en: string };
  };
  flightClass: {
    code: string;
    name: { fa: string; en: string };
  };
  departure: {
    airport: {
      code: string;
      name: { fa: string; en: string };
      city: { fa: string; en: string };
    };
    dateTime: string;
    terminal: string;
    gate: string;
  };
  arrival: {
    airport: {
      code: string;
      name: { fa: string; en: string };
      city: { fa: string; en: string };
    };
    dateTime: string;
    terminal: string;
    gate: string;
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
}

export interface SepehrFlightDetailsResponse {
  success: boolean;
  data: {
    flight: SepehrFlight & {
      amenities: string[];
      policies: {
        cancellation: string;
        changes: string;
        refund: string;
      };
    };
  };
  message: string;
}

export interface SepehrBookingRequest {
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

export interface SepehrBookingResponse {
  success: boolean;
  data: {
    bookingId: string;
    pnr: string;
    status: string;
    passengers: Array<{
      id: string;
      name: string;
      seatNumber: string;
      ticketNumber: string;
    }>;
    flight: {
      id: string;
      flightNumber: string;
      departure: {
        dateTime: string;
        airport: {
          code: string;
          name: { fa: string; en: string };
        };
      };
      arrival: {
        dateTime: string;
        airport: {
          code: string;
          name: { fa: string; en: string };
        };
      };
    };
    totalPrice: number;
    currency: string;
    paymentStatus: string;
    bookingDate: string;
  };
  message: string;
}

export interface SepehrCancelResponse {
  success: boolean;
  data: {
    bookingId: string;
    status: string;
    refundAmount: number;
    currency: string;
    cancellationDate: string;
  };
  message: string;
}

export interface SepehrBookingStatusResponse {
  success: boolean;
  data: {
    bookingId: string;
    status: string;
    pnr: string;
    passengers: Array<{
      id: string;
      name: string;
      seatNumber: string;
      ticketNumber: string;
    }>;
    flight: {
      id: string;
      flightNumber: string;
      departure: {
        dateTime: string;
        airport: {
          code: string;
          name: { fa: string; en: string };
        };
      };
      arrival: {
        dateTime: string;
        airport: {
          code: string;
          name: { fa: string; en: string };
        };
      };
    };
    totalPrice: number;
    currency: string;
    paymentStatus: string;
    bookingDate: string;
  };
  message: string;
}

@Injectable()
export class SepehrApiService {
  private readonly logger = new Logger(SepehrApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('SEPEHR_API_BASE_URL') || 'https://api.sepehrsupport.ir';
    this.apiKey = this.configService.get<string>('SEPEHR_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('SEPEHR_API_SECRET') || '';
  }

  async searchFlights(request: SepehrFlightSearchRequest): Promise<SepehrFlightSearchResponse> {
    this.logger.log(`🔍 Searching flights: ${request.departureCity} → ${request.arrivalCity}`);
    
    try {
      // Mock response for now
      const mockResponse: SepehrFlightSearchResponse = {
        success: true,
        data: {
          flights: [
            {
              id: 'sepehr-001',
              flightNumber: 'SP001',
              airline: {
                code: 'SP',
                name: { fa: 'سپهر', en: 'Sepehr' },
                logo: 'https://example.com/sepehr-logo.png'
              },
              aircraft: {
                code: 'A320',
                name: { fa: 'ایرباس A320', en: 'Airbus A320' }
              },
              flightClass: {
                code: 'Y',
                name: { fa: 'اکونومی', en: 'Economy' }
              },
              departure: {
                airport: {
                  code: request.departureCity,
                  name: { fa: 'فرودگاه مبدا', en: 'Departure Airport' },
                  city: { fa: 'شهر مبدا', en: 'Departure City' }
                },
                dateTime: new Date(request.departureDate).toISOString(),
                terminal: 'T1',
                gate: 'A1'
              },
              arrival: {
                airport: {
                  code: request.arrivalCity,
                  name: { fa: 'فرودگاه مقصد', en: 'Arrival Airport' },
                  city: { fa: 'شهر مقصد', en: 'Arrival City' }
                },
                dateTime: new Date(new Date(request.departureDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
                terminal: 'T2',
                gate: 'B1'
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
          ],
          totalCount: 1,
          searchId: 'sepehr-search-001'
        },
        message: 'Flights found successfully'
      };

      this.logger.log(`✅ Found ${mockResponse.data.flights.length} flights`);
      return mockResponse;
    } catch (error: any) {
      this.logger.error(`❌ Flight search failed: ${error.message}`);
      throw new Error(`Sepehr API error: ${error.message}`);
    }
  }

  async getFlightDetails(flightId: string): Promise<SepehrFlightDetailsResponse> {
    this.logger.log(`🔍 Getting flight details: ${flightId}`);
    
    try {
      // Mock response
      const mockResponse: SepehrFlightDetailsResponse = {
        success: true,
        data: {
          flight: {
            id: flightId,
            flightNumber: 'SP001',
            airline: {
              code: 'SP',
              name: { fa: 'سپهر', en: 'Sepehr' },
              logo: 'https://example.com/sepehr-logo.png'
            },
            aircraft: {
              code: 'A320',
              name: { fa: 'ایرباس A320', en: 'Airbus A320' }
            },
            flightClass: {
              code: 'Y',
              name: { fa: 'اکونومی', en: 'Economy' }
            },
            departure: {
              airport: {
                code: 'THR',
                name: { fa: 'فرودگاه امام خمینی', en: 'Imam Khomeini Airport' },
                city: { fa: 'تهران', en: 'Tehran' }
              },
              dateTime: new Date().toISOString(),
              terminal: 'T1',
              gate: 'A1'
            },
            arrival: {
              airport: {
                code: 'MHD',
                name: { fa: 'فرودگاه مشهد', en: 'Mashhad Airport' },
                city: { fa: 'مشهد', en: 'Mashhad' }
              },
              dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              terminal: 'T2',
              gate: 'B1'
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
            stops: 0,
            amenities: ['WiFi', 'Meal', 'Entertainment'],
            policies: {
              cancellation: '24 hours before departure',
              changes: 'Allowed with fee',
              refund: 'Partial refund available'
            }
          }
        },
        message: 'Flight details retrieved successfully'
      };

      this.logger.log(`✅ Flight details retrieved: ${flightId}`);
      return mockResponse;
    } catch (error: any) {
      this.logger.error(`❌ Get flight details failed: ${error.message}`);
      throw new Error(`Sepehr API error: ${error.message}`);
    }
  }

  async bookFlight(bookingRequest: SepehrBookingRequest): Promise<SepehrBookingResponse> {
    this.logger.log(`🔍 Booking flight: ${bookingRequest.flightId}`);
    
    try {
      // Mock booking response
      const mockResponse: SepehrBookingResponse = {
        success: true,
        data: {
          bookingId: `sepehr-booking-${Date.now()}`,
          pnr: `SP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: 'CONFIRMED',
          passengers: bookingRequest.passengers.map((passenger, index) => ({
            id: `passenger-${index + 1}`,
            name: passenger.name,
            seatNumber: `A${index + 1}`,
            ticketNumber: `TK${Date.now()}${index + 1}`
          })),
          flight: {
            id: bookingRequest.flightId,
            flightNumber: 'SP001',
            departure: {
              dateTime: new Date().toISOString(),
              airport: {
                code: 'THR',
                name: { fa: 'فرودگاه امام خمینی', en: 'Imam Khomeini Airport' }
              }
            },
            arrival: {
              dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              airport: {
                code: 'MHD',
                name: { fa: 'فرودگاه مشهد', en: 'Mashhad Airport' }
              }
            }
          },
          totalPrice: bookingRequest.passengers.length * 1500000,
          currency: 'IRR',
          paymentStatus: 'PENDING',
          bookingDate: new Date().toISOString()
        },
        message: 'Flight booked successfully'
      };

      this.logger.log(`✅ Flight booked: ${mockResponse.data.bookingId}`);
      return mockResponse;
    } catch (error: any) {
      this.logger.error(`❌ Flight booking failed: ${error.message}`);
      throw new Error(`Sepehr API error: ${error.message}`);
    }
  }

  async cancelBooking(bookingId: string): Promise<SepehrCancelResponse> {
    this.logger.log(`🔍 Cancelling booking: ${bookingId}`);
    
    try {
      // Mock cancellation response
      const mockResponse: SepehrCancelResponse = {
        success: true,
        data: {
          bookingId,
          status: 'CANCELLED',
          refundAmount: 1200000,
          currency: 'IRR',
          cancellationDate: new Date().toISOString()
        },
        message: 'Booking cancelled successfully'
      };

      this.logger.log(`✅ Booking cancelled: ${bookingId}`);
      return mockResponse;
    } catch (error: any) {
      this.logger.error(`❌ Booking cancellation failed: ${error.message}`);
      throw new Error(`Sepehr API error: ${error.message}`);
    }
  }

  async getBookingStatus(bookingId: string): Promise<SepehrBookingStatusResponse> {
    this.logger.log(`🔍 Getting booking status: ${bookingId}`);
    
    try {
      // Mock status response
      const mockResponse: SepehrBookingStatusResponse = {
        success: true,
        data: {
          bookingId,
          status: 'CONFIRMED',
          pnr: `SP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          passengers: [
            {
              id: 'passenger-1',
              name: 'John Doe',
              seatNumber: 'A1',
              ticketNumber: 'TK123456'
            }
          ],
          flight: {
            id: 'sepehr-001',
            flightNumber: 'SP001',
            departure: {
              dateTime: new Date().toISOString(),
              airport: {
                code: 'THR',
                name: { fa: 'فرودگاه امام خمینی', en: 'Imam Khomeini Airport' }
              }
            },
            arrival: {
              dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              airport: {
                code: 'MHD',
                name: { fa: 'فرودگاه مشهد', en: 'Mashhad Airport' }
              }
            }
          },
          totalPrice: 1500000,
          currency: 'IRR',
          paymentStatus: 'PAID',
          bookingDate: new Date().toISOString()
        },
        message: 'Booking status retrieved successfully'
      };

      this.logger.log(`✅ Booking status retrieved: ${bookingId}`);
      return mockResponse;
    } catch (error: any) {
      this.logger.error(`❌ Get booking status failed: ${error.message}`);
      throw new Error(`Sepehr API error: ${error.message}`);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      this.logger.log('🔍 Checking Sepehr API connection...');
      
      // Mock connection check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.logger.log('✅ Sepehr API connection successful');
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Sepehr API connection check failed: ${error.message}`);
      return false;
    }
  }
}