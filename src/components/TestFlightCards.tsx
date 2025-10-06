import React from 'react';
import { FlightCard } from './FlightCard';
import type { Flight, RefundPolicy, User, CurrencyInfo } from '../types';
import { FlightStatus, FlightSourcingType } from '../types';

const TestFlightCards: React.FC = () => {
  console.log('🚀 SENIOR TEST - TestFlightCards component mounting');
  
  // Mock data exactly like what backend returns
  const mockFlight: Flight = {
    id: "test-flight-1",
    airline: "ایران ایر",
    airlineLogoUrl: "/airlines/iran-air.png",
    flightNumber: "IR999",
    departure: {
      airportCode: "IKA",
      airportName: "فرودگاه بین‌المللی امام خمینی",
      city: "تهران",
      dateTime: "2025-09-25T10:00:00.000Z"
    },
    arrival: {
      airportCode: "MHD",
      airportName: "فرودگاه بین‌المللی مشهد",
      city: "مشهد",
      dateTime: "2025-09-25T12:00:00.000Z"
    },
    aircraft: "بوئینگ ۷۳۷",
    flightClass: "اقتصادی",
    duration: "2h 0m",
    stops: 0,
    price: 3000000,
    taxes: 200000,
    availableSeats: 150,
    totalCapacity: 180,
    baggageAllowance: "20 کیلوگرم",
    status: FlightStatus.SCHEDULED,
    bookingClosesBeforeDepartureHours: 3,
    sourcingType: FlightSourcingType.Manual,
    allotments: [],
    tenantId: "tenant-1"
  };

  const mockRefundPolicies: RefundPolicy[] = [];
  const mockCurrentUser: User | null = null;
  const mockCurrencies: CurrencyInfo[] = [];

  console.log('🚀 SENIOR TEST - About to render FlightCard with mock data');
  console.log('🚀 SENIOR TEST - Mock flight data:', mockFlight);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🚀 SENIOR TEST - Flight Card Test</h1>
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="font-bold">Mock Flight Data:</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(mockFlight, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-4">
        <FlightCard
          flight={mockFlight}
          onSelect={(flight) => {
            console.log('🚀 SENIOR TEST - Flight selected:', flight);
            alert('Flight selected: ' + flight.flightNumber);
          }}
          refundPolicies={mockRefundPolicies}
          currentUser={mockCurrentUser}
          currencies={mockCurrencies}
        />
      </div>
    </div>
  );
};

export default TestFlightCards;

import { FlightCard } from './FlightCard';
import type { Flight, RefundPolicy, User, CurrencyInfo } from '../types';
import { FlightStatus, FlightSourcingType } from '../types';

const TestFlightCards: React.FC = () => {
  console.log('🚀 SENIOR TEST - TestFlightCards component mounting');
  
  // Mock data exactly like what backend returns
  const mockFlight: Flight = {
    id: "test-flight-1",
    airline: "ایران ایر",
    airlineLogoUrl: "/airlines/iran-air.png",
    flightNumber: "IR999",
    departure: {
      airportCode: "IKA",
      airportName: "فرودگاه بین‌المللی امام خمینی",
      city: "تهران",
      dateTime: "2025-09-25T10:00:00.000Z"
    },
    arrival: {
      airportCode: "MHD",
      airportName: "فرودگاه بین‌المللی مشهد",
      city: "مشهد",
      dateTime: "2025-09-25T12:00:00.000Z"
    },
    aircraft: "بوئینگ ۷۳۷",
    flightClass: "اقتصادی",
    duration: "2h 0m",
    stops: 0,
    price: 3000000,
    taxes: 200000,
    availableSeats: 150,
    totalCapacity: 180,
    baggageAllowance: "20 کیلوگرم",
    status: FlightStatus.SCHEDULED,
    bookingClosesBeforeDepartureHours: 3,
    sourcingType: FlightSourcingType.Manual,
    allotments: [],
    tenantId: "tenant-1"
  };

  const mockRefundPolicies: RefundPolicy[] = [];
  const mockCurrentUser: User | null = null;
  const mockCurrencies: CurrencyInfo[] = [];

  console.log('🚀 SENIOR TEST - About to render FlightCard with mock data');
  console.log('🚀 SENIOR TEST - Mock flight data:', mockFlight);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🚀 SENIOR TEST - Flight Card Test</h1>
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="font-bold">Mock Flight Data:</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(mockFlight, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-4">
        <FlightCard
          flight={mockFlight}
          onSelect={(flight) => {
            console.log('🚀 SENIOR TEST - Flight selected:', flight);
            alert('Flight selected: ' + flight.flightNumber);
          }}
          refundPolicies={mockRefundPolicies}
          currentUser={mockCurrentUser}
          currencies={mockCurrencies}
        />
      </div>
    </div>
  );
};

export default TestFlightCards;



