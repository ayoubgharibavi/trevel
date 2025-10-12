import { apiService } from './apiService';

export interface SepehrPassenger {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  nationality: string;
  birthDate: string;
  passportNumber?: string;
  passportExpiryDate?: string;
}

export interface SepehrContactInfo {
  email: string;
  phone: string;
  address?: string;
}

export interface SepehrBookingRequest {
  flightId: string;
  passengers: SepehrPassenger[];
  contactInfo: SepehrContactInfo;
  totalPrice: number;
  userId: string;
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

export interface SepehrBookingStatus {
  success: boolean;
  data: {
    bookingId: string;
    status: string;
    pnr: string;
    passengers: any[];
    flight: any;
    totalPrice: number;
    currency: string;
    paymentStatus: string;
    bookingDate: string;
    lastUpdated: string;
  };
  message: string;
}

class SepehrBookingService {
  private baseUrl = '/api/v1/sepehr';

  /**
   * Book a flight through Sepehr API
   */
  async bookFlight(bookingRequest: SepehrBookingRequest): Promise<SepehrBookingResponse> {
    try {
      console.log('🚀 Booking Sepehr flight:', bookingRequest);
      
      const response = await apiService.post(`${this.baseUrl}/booking`, {
        flightId: bookingRequest.flightId,
        passengers: bookingRequest.passengers.map(passenger => ({
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          gender: passenger.gender,
          nationality: passenger.nationality,
          birthDate: passenger.birthDate,
          passportNumber: passenger.passportNumber,
          passportExpiryDate: passenger.passportExpiryDate
        })),
        contactInfo: {
          email: bookingRequest.contactInfo.email,
          phone: bookingRequest.contactInfo.phone,
          address: bookingRequest.contactInfo.address
        }
      });

      console.log('✅ Sepehr booking response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Sepehr booking failed:', error);
      throw new Error(`Sepehr booking failed: ${error.message}`);
    }
  }

  /**
   * Get booking status from Sepehr API
   */
  async getBookingStatus(bookingId: string): Promise<SepehrBookingStatus> {
    try {
      console.log('🔍 Getting Sepehr booking status:', bookingId);
      
      const response = await apiService.get(`${this.baseUrl}/booking/${bookingId}`);
      
      console.log('✅ Sepehr booking status:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get Sepehr booking status:', error);
      throw new Error(`Failed to get booking status: ${error.message}`);
    }
  }

  /**
   * Cancel a Sepehr booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    try {
      console.log('🚫 Cancelling Sepehr booking:', bookingId);
      
      const response = await apiService.post(`${this.baseUrl}/booking/${bookingId}/cancel`, {
        reason: reason || 'User requested cancellation'
      });
      
      console.log('✅ Sepehr booking cancelled:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to cancel Sepehr booking:', error);
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  /**
   * Create a booking in our system with Sepehr data
   */
  async createBookingInSystem(sepehrBookingData: SepehrBookingResponse, userId: string): Promise<any> {
    try {
      console.log('💾 Creating booking in system:', sepehrBookingData);
      
      const bookingData = {
        flightId: sepehrBookingData.data.flight.id,
        passengers: sepehrBookingData.data.passengers.map(passenger => ({
          firstName: passenger.name.split(' ')[0],
          lastName: passenger.name.split(' ').slice(1).join(' '),
          gender: 'male', // Default, should be provided in booking request
          nationality: 'IR'
        })),
        totalPrice: sepehrBookingData.data.totalPrice,
        contactEmail: '', // Should be provided in booking request
        contactPhone: '', // Should be provided in booking request
        sepehrBookingId: sepehrBookingData.data.bookingId,
        sepehrPnr: sepehrBookingData.data.pnr,
        userId: userId
      };

      const response = await apiService.post('/api/v1/bookings', bookingData);
      
      console.log('✅ Booking created in system:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create booking in system:', error);
      throw new Error(`Failed to create booking in system: ${error.message}`);
    }
  }

  /**
   * Complete booking flow: Book with Sepehr + Save to our system
   */
  async completeBookingFlow(bookingRequest: SepehrBookingRequest): Promise<any> {
    try {
      console.log('🎯 Starting complete Sepehr booking flow...');
      
      // Step 1: Book with Sepehr API
      const sepehrBooking = await this.bookFlight(bookingRequest);
      
      if (!sepehrBooking.success) {
        throw new Error('Sepehr booking failed');
      }
      
      // Step 2: Save booking to our system
      const systemBooking = await this.createBookingInSystem(sepehrBooking, bookingRequest.userId);
      
      console.log('✅ Complete booking flow successful');
      
      return {
        success: true,
        sepehrBooking: sepehrBooking,
        systemBooking: systemBooking,
        message: 'Booking completed successfully with Sepehr API and saved to system'
      };
    } catch (error: any) {
      console.error('❌ Complete booking flow failed:', error);
      throw new Error(`Complete booking flow failed: ${error.message}`);
    }
  }

  /**
   * Check Sepehr API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiService.get(`${this.baseUrl}/health`);
      return response.success;
    } catch (error: any) {
      console.error('❌ Sepehr API health check failed:', error);
      return false;
    }
  }

  /**
   * Get Sepehr credit status
   */
  async getCreditStatus(): Promise<any> {
    try {
      const response = await apiService.get(`${this.baseUrl}/credit-status`);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get Sepehr credit status:', error);
      throw new Error(`Failed to get credit status: ${error.message}`);
    }
  }
}

export const sepehrBookingService = new SepehrBookingService();
