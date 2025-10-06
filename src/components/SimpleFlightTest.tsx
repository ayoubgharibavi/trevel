import React from 'react';
import type { Flight } from '../types';
import { FlightStatus, FlightSourcingType } from '../types';

const SimpleFlightTest: React.FC = () => {
  console.log('🚀 SENIOR TEST - SimpleFlightTest component mounting');
  
  // Mock flight data exactly like backend returns
  const mockFlight: Flight = {
    id: "test-flight-simple",
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

  const flights = [mockFlight];

  console.log('🚀 SENIOR TEST - About to render simple flight card');
  console.log('🚀 SENIOR TEST - flights array:', flights);
  console.log('🚀 SENIOR TEST - flights.length:', flights.length);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🚀 SENIOR TEST - Simple Flight Card</h1>
      
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Flight Data:</h2>
        <p><strong>ID:</strong> {mockFlight.id}</p>
        <p><strong>Flight Number:</strong> {mockFlight.flightNumber}</p>
        <p><strong>From:</strong> {mockFlight.departure.city} ({mockFlight.departure.airportCode})</p>
        <p><strong>To:</strong> {mockFlight.arrival.city} ({mockFlight.arrival.airportCode})</p>
        <p><strong>Price:</strong> {mockFlight.price} + {mockFlight.taxes} = {mockFlight.price + mockFlight.taxes}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Flight Card Test</h2>
        <div className="space-y-4">
          {flights.map((flight, index) => (
            <div key={flight.id} className="border rounded p-4 bg-blue-50">
              <h3 className="font-bold text-lg">{flight.airline} - {flight.flightNumber}</h3>
              <p>{flight.departure.city} → {flight.arrival.city}</p>
              <p>Duration: {flight.duration}</p>
              <p>Price: {flight.price + flight.taxes} IRR</p>
              <button 
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => alert(`Selected: ${flight.flightNumber}`)}
              >
                Select Flight
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleFlightTest;
