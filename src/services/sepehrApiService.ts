import { SepehrFlightSearchDto, SepehrBookingDto } from '../types/sepehr';

const API_BASE_URL = 'http://89.42.199.60/api/v1';

export interface SepehrFlight {
  id: string;
  airline: {
    code: string;
    name: string;
    logoUrl?: string;
  };
  flightNumber: string;
  departure: {
    airportCode: string;
    airportName: string;
    city: string;
    terminal?: string;
    gate?: string;
    dateTime: string;
  };
  arrival: {
    airportCode: string;
    airportName: string;
    city: string;
    terminal?: string;
    gate?: string;
    dateTime: string;
  };
  aircraft: string;
  flightClass: string;
  duration: string;
  stops: number;
  price: {
    base: number;
    taxes: number;
    total: number;
    currency: string;
  };
  availableSeats: number;
  totalCapacity: number;
  baggageAllowance: string;
  status: string;
  bookingClass?: string;
  fareRules?: any;
}

export interface SepehrSearchResponse {
  success: boolean;
  data: SepehrFlight[];
  message?: string;
  errorCode?: string;
}

export interface SepehrBookingResponse {
  success: boolean;
  data: {
    bookingId: string;
    status: string;
    passengers: any[];
    flight: SepehrFlight;
    totalPrice: number;
    currency: string;
  };
  message?: string;
}

export class SepehrApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * جستجوی پرواز از طریق API سپهر
   */
  async searchFlights(searchDto: SepehrFlightSearchDto): Promise<SepehrSearchResponse> {
    try {
      console.log('🔍 Searching flights via Sepehr API:', searchDto);

      const response = await fetch(`${this.baseUrl}/sepehr/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sepehr API response received:', data);

      return data;
    } catch (error) {
      console.error('❌ Error calling Sepehr API:', error);
      throw error;
    }
  }

  /**
   * دریافت جزئیات پرواز از API سپهر
   */
  async getFlightDetails(flightId: string): Promise<SepehrFlight> {
    try {
      console.log('🔍 Getting flight details from Sepehr API:', flightId);

      const response = await fetch(`${this.baseUrl}/sepehr/${flightId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Flight details received from Sepehr API:', data);

      return data;
    } catch (error) {
      console.error('❌ Error getting flight details from Sepehr API:', error);
      throw error;
    }
  }

  /**
   * رزرو پرواز از طریق API سپهر
   */
  async bookFlight(bookingDto: SepehrBookingDto): Promise<SepehrBookingResponse> {
    try {
      console.log('🔍 Booking flight via Sepehr API:', bookingDto);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/sepehr/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Flight booked successfully via Sepehr API:', data);

      return data;
    } catch (error) {
      console.error('❌ Error booking flight via Sepehr API:', error);
      throw error;
    }
  }

  /**
   * دریافت وضعیت رزرو از API سپهر
   */
  async getBookingStatus(bookingId: string): Promise<any> {
    try {
      console.log('🔍 Getting booking status from Sepehr API:', bookingId);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/sepehr/booking/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Booking status received from Sepehr API:', data);

      return data;
    } catch (error) {
      console.error('❌ Error getting booking status from Sepehr API:', error);
      throw error;
    }
  }

  /**
   * بررسی اتصال به API سپهر
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sepehr/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('❌ Sepehr API connection check failed:', error);
      return false;
    }
  }

  /**
   * تبدیل فرمت جستجوی داخلی به فرمت سپهر
   */
  convertSearchQueryToSepehr(searchQuery: any): SepehrFlightSearchDto {
    return {
      departureCity: searchQuery.from,
      arrivalCity: searchQuery.to,
      departureDate: searchQuery.departureDate,
      returnDate: searchQuery.returnDate,
      adults: searchQuery.passengers?.adults || 1,
      children: searchQuery.passengers?.children || 0,
      infants: searchQuery.passengers?.infants || 0,
      cabinClass: 'Y', // Default to Economy
    };
  }

  /**
   * تبدیل فرمت پرواز سپهر به فرمت داخلی
   */
  convertSepehrFlightToInternal(sepehrFlight: SepehrFlight): any {
    return {
      id: sepehrFlight.id,
      airline: sepehrFlight.airline.name,
      airlineLogoUrl: sepehrFlight.airline.logoUrl,
      flightNumber: sepehrFlight.flightNumber,
      departure: {
        airportCode: sepehrFlight.departure.airportCode,
        airportName: sepehrFlight.departure.airportName,
        city: sepehrFlight.departure.city,
        dateTime: sepehrFlight.departure.dateTime,
        terminal: sepehrFlight.departure.terminal,
        gate: sepehrFlight.departure.gate,
      },
      arrival: {
        airportCode: sepehrFlight.arrival.airportCode,
        airportName: sepehrFlight.arrival.airportName,
        city: sepehrFlight.arrival.city,
        dateTime: sepehrFlight.arrival.dateTime,
        terminal: sepehrFlight.arrival.terminal,
        gate: sepehrFlight.arrival.gate,
      },
      aircraft: sepehrFlight.aircraft,
      flightClass: sepehrFlight.flightClass,
      duration: sepehrFlight.duration,
      stops: sepehrFlight.stops,
      price: sepehrFlight.price.total,
      taxes: sepehrFlight.price.taxes,
      availableSeats: sepehrFlight.availableSeats,
      totalCapacity: sepehrFlight.totalCapacity,
      baggageAllowance: sepehrFlight.baggageAllowance,
      status: sepehrFlight.status,
      sourcingType: 'SEPEHR_API', // Mark as from Sepehr API
    };
  }
}

export const sepehrApiService = new SepehrApiService();
