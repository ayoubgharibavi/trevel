import React, { useState, useMemo } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface FlightComparisonData {
  airline: string;
  direct: number | null;
  oneStop: number | null;
  moreThanOneStop: number | null;
}

interface FlightComparisonTableProps {
  flights?: any[]; // Optional flights data to generate comparison
}

export const FlightComparisonTable: React.FC<FlightComparisonTableProps> = ({
  flights = []
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Generate flight comparison data based on flights or mock data
  const comparisonData: FlightComparisonData[] = useMemo(() => {
    if (flights.length > 0) {
      // Generate from actual flights data
      const airlineMap = new Map<string, { direct: number[], oneStop: number[], moreThanOneStop: number[] }>();
      
      flights.forEach(flight => {
        const airline = typeof flight.airline === 'string' ? flight.airline : flight.airline?.name || 'نامشخص';
        const price = Number(flight.price) + Number(flight.taxes);
        
        if (!airlineMap.has(airline)) {
          airlineMap.set(airline, { direct: [], oneStop: [], moreThanOneStop: [] });
        }
        
        const data = airlineMap.get(airline)!;
        if (flight.stops === 0) {
          data.direct.push(price);
        } else if (flight.stops === 1) {
          data.oneStop.push(price);
        } else {
          data.moreThanOneStop.push(price);
        }
      });

      return Array.from(airlineMap.entries()).map(([airline, prices]) => ({
        airline,
        direct: prices.direct.length > 0 ? Math.min(...prices.direct) : null,
        oneStop: prices.oneStop.length > 0 ? Math.min(...prices.oneStop) : null,
        moreThanOneStop: prices.moreThanOneStop.length > 0 ? Math.min(...prices.moreThanOneStop) : null
      }));
    } else {
      // Generate mock data
      const airlines = ['IranAir', 'IRAN AIRTOUR', 'Flydubai', 'Emirates', 'AJET', 'AirArabia', 'Qeshm Air', 'Mahan Airlines'];
      return airlines.map(airline => ({
        airline,
        direct: Math.random() > 0.2 ? Math.round(5000000 + Math.random() * 10000000) : null,
        oneStop: Math.random() > 0.6 ? Math.round(4000000 + Math.random() * 8000000) : null,
        moreThanOneStop: Math.random() > 0.8 ? Math.round(3000000 + Math.random() * 6000000) : null
      }));
    }
  }, [flights]);

  const totalPages = Math.ceil(comparisonData.length / itemsPerPage);
  const currentData = comparisonData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const formatPrice = (price: number): string => {
    return (price / 1000000).toFixed(1);
  };

  const navigatePage = (direction: 'prev' | 'next') => {
    setCurrentPage(prev => {
      const newPage = direction === 'prev' ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(totalPages - 1, newPage));
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">م</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">مقایسه قیمت و توقف‌ها</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigatePage('prev')}
            disabled={currentPage === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-90" />
          </button>
          <button 
            onClick={() => navigatePage('next')}
            disabled={currentPage === totalPages - 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-400 -rotate-90" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">قیمت بر اساس میلیون تومان است</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2 font-medium text-gray-700">شرکت هواپیمایی</th>
              <th className="text-center py-2 font-medium text-gray-700">مستقیم</th>
              <th className="text-center py-2 font-medium text-gray-700">یک توقف</th>
              <th className="text-center py-2 font-medium text-gray-700">بیش از یک توقف</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{row.airline}</td>
                <td className="py-3 text-center text-gray-600">
                  {row.direct ? `${formatPrice(row.direct)}` : '--'}
                </td>
                <td className="py-3 text-center text-gray-600">
                  {row.oneStop ? `${formatPrice(row.oneStop)}` : '--'}
                </td>
                <td className="py-3 text-center text-gray-600">
                  {row.moreThanOneStop ? `${formatPrice(row.moreThanOneStop)}` : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              صفحه {currentPage + 1} از {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
