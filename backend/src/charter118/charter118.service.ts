import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface Charter118FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
}

export interface Charter118FlightSearchResponse {
  success: boolean;
  data?: any[];
  error?: string;
  message?: string;
}

export interface Charter118BookingRequest {
  flightId: string;
  passengers: {
    adults: any[];
    children?: any[];
    infants?: any[];
  };
  contactInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
}

export interface Charter118BookingResponse {
  success: boolean;
  bookingId?: string;
  confirmationCode?: string;
  data?: any;
  error?: string;
  message?: string;
}

@Injectable()
export class Charter118Service {
  private readonly logger = new Logger(Charter118Service.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('CHARTER118_BASE_URL') || 'https://api.charter118.com';
    this.apiKey = this.configService.get<string>('CHARTER118_API_KEY') || '';
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Trevel-Booking-System/1.0'
      }
    });

    // Add API key to headers if provided
    if (this.apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Charter118 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Charter118 API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Charter118 API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Charter118 API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * جستجوی پروازها در Charter118
   */
  async searchFlights(searchRequest: Charter118FlightSearchRequest): Promise<Charter118FlightSearchResponse> {
    try {
      this.logger.log(`Searching flights: ${searchRequest.origin} → ${searchRequest.destination}`);
      
      // Mock data for demonstration - replace with actual API call
      const mockFlights = [
        {
          id: 'charter118-001',
          flightNumber: 'C118-001',
          airline: 'Charter118 Airline',
          departure: {
            airport: searchRequest.origin,
            airportCode: searchRequest.origin === 'تهران' ? 'IKA' : 'DXB',
            city: searchRequest.origin,
            dateTime: searchRequest.departureDate + 'T10:00:00.000Z',
            terminal: 'T1',
            gate: 'C1'
          },
          arrival: {
            airport: searchRequest.destination,
            airportCode: searchRequest.destination === 'دبی' ? 'DXB' : 'IKA',
            city: searchRequest.destination,
            dateTime: searchRequest.departureDate + 'T13:30:00.000Z',
            terminal: 'T1',
            gate: 'D1'
          },
          aircraft: 'Boeing 737',
          flightClass: 'Economy',
          duration: '3h 30m',
          stops: 0,
          price: 1800000,
          taxes: 180000,
          availableSeats: 80,
          totalCapacity: 150,
          baggageAllowance: '25 KG',
          status: 'ON_TIME'
        },
        {
          id: 'charter118-002',
          flightNumber: 'C118-002',
          airline: 'Charter118 Express',
          departure: {
            airport: searchRequest.origin,
            airportCode: searchRequest.origin === 'تهران' ? 'IKA' : 'DXB',
            city: searchRequest.origin,
            dateTime: searchRequest.departureDate + 'T16:00:00.000Z',
            terminal: 'T2',
            gate: 'C2'
          },
          arrival: {
            airport: searchRequest.destination,
            airportCode: searchRequest.destination === 'دبی' ? 'DXB' : 'IKA',
            city: searchRequest.destination,
            dateTime: searchRequest.departureDate + 'T19:30:00.000Z',
            terminal: 'T2',
            gate: 'D2'
          },
          aircraft: 'Airbus A320',
          flightClass: 'Economy',
          duration: '3h 30m',
          stops: 0,
          price: 1650000,
          taxes: 165000,
          availableSeats: 95,
          totalCapacity: 180,
          baggageAllowance: '25 KG',
          status: 'ON_TIME'
        }
      ];

      this.logger.log(`Found ${mockFlights.length} mock flights`);
      return {
        success: true,
        data: mockFlights,
        message: 'Mock flights found successfully'
      };
    } catch (error: any) {
      this.logger.error('Charter118 search error:', error);
      return {
        success: false,
        error: error.message || 'Search request failed',
        message: 'Unable to search flights'
      };
    }
  }

  /**
   * دریافت جزئیات پرواز
   */
  async getFlightDetails(flightId: string): Promise<Charter118FlightSearchResponse> {
    try {
      this.logger.log(`Getting flight details for ID: ${flightId}`);
      
      const response: AxiosResponse = await this.httpClient.get(`/flights/${flightId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Flight not found',
          message: 'Unable to get flight details'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 get flight details error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: 'Unable to get flight details'
      };
    }
  }

  /**
   * رزرو پرواز
   */
  async bookFlight(bookingRequest: Charter118BookingRequest): Promise<Charter118BookingResponse> {
    try {
      this.logger.log(`Booking flight: ${bookingRequest.flightId}`);
      
      // Mock response for demonstration - replace with actual API call
      const mockBookingResponse = {
        success: true,
        booking_id: `C118-BOOK-${Date.now()}`,
        confirmation_code: `C118-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        data: {
          flightId: bookingRequest.flightId,
          passengers: bookingRequest.passengers,
          contactInfo: bookingRequest.contactInfo,
          bookingDate: new Date().toISOString(),
          status: 'CONFIRMED'
        },
        message: 'Booking completed successfully'
      };

      this.logger.log(`Mock booking successful: ${mockBookingResponse.booking_id}`);
      return {
        success: true,
        bookingId: mockBookingResponse.booking_id,
        confirmationCode: mockBookingResponse.confirmation_code,
        data: mockBookingResponse.data,
        message: mockBookingResponse.message
      };
      
      // Original API call (commented out for mock)
      /*
      const response: AxiosResponse = await this.httpClient.post('/bookings', {
        flight_id: bookingRequest.flightId,
        passengers: {
          adults: bookingRequest.passengers.adults,
          children: bookingRequest.passengers.children || [],
          infants: bookingRequest.passengers.infants || []
        },
        contact_info: {
          email: bookingRequest.contactInfo.email,
          phone: bookingRequest.contactInfo.phone,
          first_name: bookingRequest.contactInfo.firstName,
          last_name: bookingRequest.contactInfo.lastName
        }
      });

      if (response.data && response.data.success) {
        this.logger.log(`Booking successful: ${response.data.booking_id}`);
        return {
          success: true,
          bookingId: response.data.booking_id,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        this.logger.warn('Charter118 booking returned unsuccessful response');
        return {
          success: false,
          error: response.data?.message || 'Booking failed',
          message: 'Unable to complete booking'
        };
      }
      */
    } catch (error: any) {
      this.logger.error('Charter118 booking error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Booking request failed',
        message: 'Unable to complete booking'
      };
    }
  }

  /**
   * دریافت وضعیت رزرو
   */
  async getBookingStatus(bookingId: string): Promise<Charter118BookingResponse> {
    try {
      this.logger.log(`Getting booking status: ${bookingId}`);
      
      const response: AxiosResponse = await this.httpClient.get(`/bookings/${bookingId}`);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Booking not found',
          message: 'Unable to get booking status'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 get booking status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: 'Unable to get booking status'
      };
    }
  }

  /**
   * لغو رزرو
   */
  async cancelBooking(bookingId: string): Promise<Charter118BookingResponse> {
    try {
      this.logger.log(`Cancelling booking: ${bookingId}`);
      
      const response: AxiosResponse = await this.httpClient.delete(`/bookings/${bookingId}`);

      if (response.data && response.data.success) {
        this.logger.log(`Booking cancelled successfully: ${bookingId}`);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Cancellation failed',
          message: 'Unable to cancel booking'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 cancel booking error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Cancellation request failed',
        message: 'Unable to cancel booking'
      };
    }
  }

  /**
   * تست اتصال به API
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      this.logger.log('Testing Charter118 API connection');
      
      // Try a simple GET request to test connection
      const response: AxiosResponse = await this.httpClient.get('/health');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: 'Charter118 API connection successful',
          data: response.data
        };
      } else {
        return {
          success: false,
          message: 'Charter118 API connection failed'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 connection test error:', error);
      return {
        success: false,
        message: `Charter118 API connection failed: ${error.message}`
      };
    }
  }

  /**
   * دریافت لیست فرودگاه‌ها
   */
  async getAirports(): Promise<Charter118FlightSearchResponse> {
    try {
      this.logger.log('Getting airports list from Charter118');
      
      const response: AxiosResponse = await this.httpClient.get('/airports');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Unable to get airports',
          message: 'Unable to fetch airports list'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 get airports error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: 'Unable to fetch airports list'
      };
    }
  }

  /**
   * دریافت لیست ایرلاین‌ها
   */
  async getAirlines(): Promise<Charter118FlightSearchResponse> {
    try {
      this.logger.log('Getting airlines list from Charter118');
      
      const response: AxiosResponse = await this.httpClient.get('/airlines');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Unable to get airlines',
          message: 'Unable to fetch airlines list'
        };
      }
    } catch (error: any) {
      this.logger.error('Charter118 get airlines error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        message: 'Unable to fetch airlines list'
      };
    }
  }
}

















