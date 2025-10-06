import React from 'react';
import type { Flight } from '@/types';

interface SimpleFlightDisplayProps {
  flight: Flight;
}

export const SimpleFlightDisplay: React.FC<SimpleFlightDisplayProps> = ({ flight }) => {
  console.log('🚀 SIMPLE - SimpleFlightDisplay mounted');
  console.log('🚀 SIMPLE - Flight:', flight);
  
  return (
    <div style={{ 
      border: '2px solid red', 
      padding: '20px', 
      margin: '20px',
      backgroundColor: 'lightblue',
      borderRadius: '10px'
    }}>
      <h2 style={{ color: 'red', fontSize: '24px' }}>🚀 SIMPLE FLIGHT CARD</h2>
      <p><strong>Flight ID:</strong> {flight.id}</p>
      <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
      <p><strong>Airline:</strong> {typeof flight.airline === 'string' ? flight.airline : flight.airline?.name || 'Unknown'}</p>
      <p><strong>From:</strong> {flight.departure?.city || 'Unknown'} ({flight.departure?.airportCode || 'Unknown'})</p>
      <p><strong>To:</strong> {flight.arrival?.city || 'Unknown'} ({flight.arrival?.airportCode || 'Unknown'})</p>
      <p><strong>Price:</strong> {flight.price}</p>
      <p><strong>Taxes:</strong> {flight.taxes}</p>
      <p><strong>Duration:</strong> {flight.duration}</p>
      <button 
        style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Flight selected!')}
      >
        SELECT THIS FLIGHT
      </button>
    </div>
  );
};

import type { Flight } from '@/types';

interface SimpleFlightDisplayProps {
  flight: Flight;
}

export const SimpleFlightDisplay: React.FC<SimpleFlightDisplayProps> = ({ flight }) => {
  console.log('🚀 SIMPLE - SimpleFlightDisplay mounted');
  console.log('🚀 SIMPLE - Flight:', flight);
  
  return (
    <div style={{ 
      border: '2px solid red', 
      padding: '20px', 
      margin: '20px',
      backgroundColor: 'lightblue',
      borderRadius: '10px'
    }}>
      <h2 style={{ color: 'red', fontSize: '24px' }}>🚀 SIMPLE FLIGHT CARD</h2>
      <p><strong>Flight ID:</strong> {flight.id}</p>
      <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
      <p><strong>Airline:</strong> {typeof flight.airline === 'string' ? flight.airline : flight.airline?.name || 'Unknown'}</p>
      <p><strong>From:</strong> {flight.departure?.city || 'Unknown'} ({flight.departure?.airportCode || 'Unknown'})</p>
      <p><strong>To:</strong> {flight.arrival?.city || 'Unknown'} ({flight.arrival?.airportCode || 'Unknown'})</p>
      <p><strong>Price:</strong> {flight.price}</p>
      <p><strong>Taxes:</strong> {flight.taxes}</p>
      <p><strong>Duration:</strong> {flight.duration}</p>
      <button 
        style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Flight selected!')}
      >
        SELECT THIS FLIGHT
      </button>
    </div>
  );
};



