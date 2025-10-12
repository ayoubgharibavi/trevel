export interface SepehrFlightSearchDto {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  class: string;
}

export interface SepehrPassengerDto {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  birthDate: string;
  nationality: string;
}

export interface SepehrContactInfoDto {
  email: string;
  phone: string;
}

export interface SepehrPaymentInfoDto {
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface SepehrBookingDto {
  flightId: string;
  passengers: SepehrPassengerDto[];
  contactInfo: SepehrContactInfoDto;
  paymentInfo: SepehrPaymentInfoDto;
}

export interface SepehrBookingResponse {
  success: boolean;
  data?: {
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
  message?: string;
  error?: string;
}

