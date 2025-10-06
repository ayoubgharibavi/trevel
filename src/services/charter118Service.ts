import { apiService } from './apiService';

export interface Charter118FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
}

export interface Charter118Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: number;
  price: number;
  taxes: number;
  availableSeats: number;
  aircraft: string;
}

export interface Charter118BookingRequest {
  flightId: string;
  passengers: {
    adults: Array<{
      firstName: string;
      lastName: string;
      nationality: string;
      passportNumber: string;
      birthDate: string;
    }>;
    children: Array<{
      firstName: string;
      lastName: string;
      nationality: string;
      passportNumber: string;
      birthDate: string;
    }>;
    infants: Array<{
      firstName: string;
      lastName: string;
      nationality: string;
      passportNumber: string;
      birthDate: string;
    }>;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface Charter118BookingResponse {
  bookingId: string;
  status: 'confirmed' | 'pending' | 'failed';
  totalPrice: number;
  currency: string;
  confirmationCode: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    seatNumber?: string;
  }>;
}

class Charter118Service {
  private baseUrl = '/api/v1/charter118';

  async searchFlights(request: Charter118FlightSearchRequest): Promise<Charter118Flight[]> {
    try {
      const response = await apiService.post(`${this.baseUrl}/search`, request);
      return response.data;
    } catch (error) {
      console.error('Charter118 search error:', error);
      throw new Error('خطا در جستجوی پروازهای چارتر 118');
    }
  }

  async getFlightDetails(flightId: string): Promise<Charter118Flight> {
    try {
      const response = await apiService.get(`${this.baseUrl}/flights/${flightId}`);
      return response.data;
    } catch (error) {
      console.error('Charter118 flight details error:', error);
      throw new Error('خطا در دریافت جزئیات پرواز');
    }
  }

  async createBooking(request: Charter118BookingRequest): Promise<Charter118BookingResponse> {
    try {
      const response = await apiService.post(`${this.baseUrl}/book`, request);
      return response.data;
    } catch (error) {
      console.error('Charter118 booking error:', error);
      throw new Error('خطا در ایجاد رزرو');
    }
  }

  async getBookingStatus(bookingId: string): Promise<Charter118BookingResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Charter118 booking status error:', error);
      throw new Error('خطا در دریافت وضعیت رزرو');
    }
  }

  async cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Charter118 cancel booking error:', error);
      throw new Error('خطا در لغو رزرو');
    }
  }

  async getAvailableSeats(flightId: string): Promise<Array<{ seatNumber: string; available: boolean; price?: number }>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/flights/${flightId}/seats`);
      return response.data;
    } catch (error) {
      console.error('Charter118 seats error:', error);
      throw new Error('خطا در دریافت صندلی‌های موجود');
    }
  }

  async selectSeat(flightId: string, seatNumber: string, passengerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/flights/${flightId}/seats/${seatNumber}`, {
        passengerId
      });
      return response.data;
    } catch (error) {
      console.error('Charter118 seat selection error:', error);
      throw new Error('خطا در انتخاب صندلی');
    }
  }

  async getBookingHistory(): Promise<Charter118BookingResponse[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/bookings/history`);
      return response.data;
    } catch (error) {
      console.error('Charter118 booking history error:', error);
      throw new Error('خطا در دریافت تاریخچه رزروها');
    }
  }

  async getPopularDestinations(): Promise<Array<{ city: string; country: string; price: number; image: string }>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/destinations/popular`);
      return response.data;
    } catch (error) {
      console.error('Charter118 popular destinations error:', error);
      throw new Error('خطا در دریافت مقاصد محبوب');
    }
  }

  async getFlightSchedule(origin: string, destination: string): Promise<Array<{ date: string; flights: Charter118Flight[] }>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/schedule`, {
        params: { origin, destination }
      });
      return response.data;
    } catch (error) {
      console.error('Charter118 schedule error:', error);
      throw new Error('خطا در دریافت برنامه پروازها');
    }
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.get(`${this.baseUrl}/health`);
      return { success: response.success, message: response.data?.message };
    } catch (error) {
      console.error('Charter118 connection test error:', error);
      return { success: false, message: 'خطا در اتصال به سرویس چارتر 118' };
    }
  }
}

export const charter118Service = new Charter118Service();













