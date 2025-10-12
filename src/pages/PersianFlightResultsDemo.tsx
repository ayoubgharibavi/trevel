import React, { useState } from 'react';
import { PersianFlightResults } from '@/components/PersianFlightResults';
import { Flight, SearchQuery, RefundPolicy, Advertisement, User, Currency } from '@/types';

// Mock data for testing
const mockFlights: Flight[] = [
  {
    id: '1',
    airline: 'AirArabia',
    airlineLogoUrl: '/airlines/airarabia.svg',
    flightNumber: 'G9-123',
    departure: {
      airportCode: 'SHJ',
      airportName: 'Sharjah International Airport',
      city: 'Sharjah',
      dateTime: '2024-01-15T16:55:00Z'
    },
    arrival: {
      airportCode: 'IKA',
      airportName: 'Imam Khomeini International Airport',
      city: 'Tehran',
      dateTime: '2024-01-15T14:25:00Z'
    },
    duration: 120, // 2 hours in minutes
    stops: 0,
    price: 5410000,
    taxes: 0,
    flightClass: 'Economy',
    aircraft: 'A320',
    availableSeats: 4,
    baggageAllowance: '30 KG',
    status: 'ON_TIME' as any,
    bookingClosesBeforeDepartureHours: 24,
    sourcingType: 'Charter' as any,
    allotments: [],
    tenantId: 'default'
  },
  {
    id: '2',
    airline: 'Qeshm Air',
    airlineLogoUrl: '/airlines/qeshm-air.svg',
    flightNumber: 'QB-456',
    departure: {
      airportCode: 'DXB',
      airportName: 'Dubai International Airport',
      city: 'Dubai',
      dateTime: '2024-01-15T13:40:00Z'
    },
    arrival: {
      airportCode: 'IKA',
      airportName: 'Imam Khomeini International Airport',
      city: 'Tehran',
      dateTime: '2024-01-15T10:50:00Z'
    },
    duration: 140, // 2 hours 20 minutes
    stops: 0,
    price: 5330000,
    taxes: 0,
    flightClass: 'Economy',
    aircraft: 'A320',
    availableSeats: 5,
    baggageAllowance: '30 KG',
    status: 'ON_TIME' as any,
    bookingClosesBeforeDepartureHours: 24,
    sourcingType: 'Charter' as any,
    allotments: [],
    tenantId: 'default'
  },
  {
    id: '3',
    airline: 'Mahan Airlines',
    airlineLogoUrl: '/airlines/mahan-air.svg',
    flightNumber: 'W5-789',
    departure: {
      airportCode: 'DXB',
      airportName: 'Dubai International Airport',
      city: 'Dubai',
      dateTime: '2024-01-15T09:30:00Z'
    },
    arrival: {
      airportCode: 'IKA',
      airportName: 'Imam Khomeini International Airport',
      city: 'Tehran',
      dateTime: '2024-01-15T06:50:00Z'
    },
    duration: 130, // 2 hours 10 minutes
    stops: 0,
    price: 12488000,
    taxes: 0,
    flightClass: 'Economy',
    aircraft: 'A320',
    availableSeats: 3,
    baggageAllowance: '30 KG',
    status: 'ON_TIME' as any,
    bookingClosesBeforeDepartureHours: 24,
    sourcingType: 'WebService' as any,
    allotments: [],
    tenantId: 'default'
  },
  {
    id: '4',
    airline: 'Flydubai',
    airlineLogoUrl: '/airlines/flydubai.svg',
    flightNumber: 'FZ-101',
    departure: {
      airportCode: 'DXB',
      airportName: 'Dubai International Airport',
      city: 'Dubai',
      dateTime: '2024-01-15T02:44:00Z'
    },
    arrival: {
      airportCode: 'IKA',
      airportName: 'Imam Khomeini International Airport',
      city: 'Tehran',
      dateTime: '2024-01-14T23:59:00Z'
    },
    duration: 135, // 2 hours 15 minutes
    stops: 0,
    price: 12550000,
    taxes: 0,
    flightClass: 'Economy',
    aircraft: 'B737',
    availableSeats: 5,
    baggageAllowance: '30 KG',
    status: 'ON_TIME' as any,
    bookingClosesBeforeDepartureHours: 24,
    sourcingType: 'Charter' as any,
    allotments: [],
    tenantId: 'default'
  },
  {
    id: '5',
    airline: 'Iran Airtour',
    airlineLogoUrl: '/airlines/iran-airtour.svg',
    flightNumber: 'B9-202',
    departure: {
      airportCode: 'DXB',
      airportName: 'Dubai International Airport',
      city: 'Dubai',
      dateTime: '2024-01-15T11:05:00Z'
    },
    arrival: {
      airportCode: 'IKA',
      airportName: 'Imam Khomeini International Airport',
      city: 'Tehran',
      dateTime: '2024-01-15T08:35:00Z'
    },
    duration: 120, // 2 hours
    stops: 0,
    price: 6224000,
    taxes: 0,
    flightClass: 'Economy',
    aircraft: 'A320',
    availableSeats: 7,
    baggageAllowance: '30 KG',
    status: 'ON_TIME' as any,
    bookingClosesBeforeDepartureHours: 24,
    sourcingType: 'WebService' as any,
    allotments: [],
    tenantId: 'default'
  }
];

const mockSearchQuery: SearchQuery = {
  tripType: 'OneWay' as any,
  from: 'تهران',
  to: 'دبی',
  departureDate: '2024-01-15',
  passengers: {
    adults: 1,
    children: 0,
    infants: 0
  }
};

const mockRefundPolicies: RefundPolicy[] = [];
const mockAdvertisements: Advertisement[] = [];
const mockCurrentUser: User | null = null;
const mockCurrencies: Currency[] = ['IRR', 'USD'];
const mockPopularRoutes: any[] = [];

export const PersianFlightResultsDemo: React.FC = () => {
  const [flights] = useState<Flight[]>(mockFlights);

  const handleSelectFlight = (flight: Flight) => {
    console.log('Selected flight:', flight);
    alert(`پرواز ${flight.flightNumber} انتخاب شد!`);
  };

  const handleSearch = (query: SearchQuery) => {
    console.log('New search query:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PersianFlightResults
        flights={flights}
        searchQuery={mockSearchQuery}
        onSelectFlight={handleSelectFlight}
        refundPolicies={mockRefundPolicies}
        advertisements={mockAdvertisements}
        currentUser={mockCurrentUser}
        currencies={mockCurrencies}
        popularRoutes={mockPopularRoutes}
        onSearch={handleSearch}
      />
    </div>
  );
};







