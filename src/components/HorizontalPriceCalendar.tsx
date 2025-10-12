import React, { useState, useEffect } from 'react';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface PriceCalendarData {
  date: string;
  dayName: string;
  dayNumber: string;
  monthNumber: string;
  price: number;
  isSelected: boolean;
  isLowest: boolean;
  isHighest: boolean;
}

interface HorizontalPriceCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  flights?: any[]; // Add flights prop
}

export const HorizontalPriceCalendar: React.FC<HorizontalPriceCalendarProps> = ({
  onDateSelect,
  selectedDate,
  flights = []
}) => {
  const { language } = useLocalization();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [priceData, setPriceData] = useState<PriceCalendarData[]>([]);

  // Generate price data based on actual flights
  useEffect(() => {
    const generatePriceData = () => {
      console.log('📅 Generating price calendar data for flights:', flights.length);
      console.log('📅 Sample flight data:', flights.slice(0, 3).map(f => ({
        id: f.id,
        flightNumber: f.flightNumber,
        departure: f.departure,
        price: f.price,
        taxes: f.taxes
      })));
      
      const data: PriceCalendarData[] = [];
      const today = new Date();
      const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
      const englishDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayNames = language === 'en' ? englishDays : persianDays;
      
      // If no flights data, generate realistic mock data
      if (flights.length === 0) {
        console.log('📅 No flights data available, generating realistic mock calendar');
        // Generate realistic price data for demonstration
        const mockPrices = [
          { dayOffset: -7, price: 12000000, isLowest: false, isHighest: true },
          { dayOffset: -6, price: 8500000, isLowest: false, isHighest: false },
          { dayOffset: -5, price: 9200000, isLowest: false, isHighest: false },
          { dayOffset: -4, price: 7800000, isLowest: true, isHighest: false },
          { dayOffset: -3, price: 9500000, isLowest: false, isHighest: false },
          { dayOffset: -2, price: 8800000, isLowest: false, isHighest: false },
          { dayOffset: -1, price: 10500000, isLowest: false, isHighest: false },
          { dayOffset: 0, price: 8200000, isLowest: false, isHighest: false },
          { dayOffset: 1, price: 9800000, isLowest: false, isHighest: false },
          { dayOffset: 2, price: 9100000, isLowest: false, isHighest: false },
          { dayOffset: 3, price: 8700000, isLowest: false, isHighest: false },
          { dayOffset: 4, price: 9300000, isLowest: false, isHighest: false },
          { dayOffset: 5, price: 11000000, isLowest: false, isHighest: false },
          { dayOffset: 6, price: 8900000, isLowest: false, isHighest: false }
        ];
        
        mockPrices.forEach((item, index) => {
          const mockDate = new Date(today);
          mockDate.setDate(today.getDate() + item.dayOffset);
          
          data.push({
            date: mockDate.toISOString().split('T')[0],
            dayName: dayNames[mockDate.getDay()],
            dayNumber: mockDate.getDate().toString().padStart(2, '0'),
            monthNumber: (mockDate.getMonth() + 1).toString().padStart(2, '0'),
            price: item.price,
            isSelected: index === 7, // Today is selected
            isLowest: item.isLowest,
            isHighest: item.isHighest
          });
        });
        
        setPriceData(data);
        return;
      }
      
      // Generate data only for dates that have flights
      const flightDates = new Set<string>();
      
      // First, collect all unique dates that have flights
      flights.forEach(flight => {
        let flightDate: Date | null = null;
        
        if (flight.departure?.dateTime) {
          flightDate = new Date(flight.departure.dateTime);
        } else if (flight.departure?.date) {
          flightDate = new Date(flight.departure.date);
        } else if (flight.departure) {
          // Try to construct date from departure object
          const dep = flight.departure as any;
          if (dep.year && dep.month && dep.day) {
            flightDate = new Date(dep.year, dep.month - 1, dep.day);
          }
        }
        
        if (flightDate && !isNaN(flightDate.getTime())) {
          flightDates.add(flightDate.toISOString().split('T')[0]);
        }
      });
      
      console.log('📅 Flight dates found:', Array.from(flightDates));
      
      // Generate data only for dates with flights
      Array.from(flightDates).sort().forEach((dateString, index) => {
        const date = new Date(dateString);
        
        // Find flights for this date
        const flightsForDate = flights.filter(flight => {
          let flightDate: Date | null = null;
          
          if (flight.departure?.dateTime) {
            flightDate = new Date(flight.departure.dateTime);
          } else if (flight.departure?.date) {
            flightDate = new Date(flight.departure.date);
          } else if (flight.departure) {
            const dep = flight.departure as any;
            if (dep.year && dep.month && dep.day) {
              flightDate = new Date(dep.year, dep.month - 1, dep.day);
            }
          }
          
          if (!flightDate || isNaN(flightDate.getTime())) {
            return false;
          }
          
          return flightDate.toISOString().split('T')[0] === dateString;
        });
        
        console.log(`📅 Date ${dateString}: Found ${flightsForDate.length} flights`);
        
        // Calculate price for this date
        const price = Math.min(...flightsForDate.map(flight => 
          Number(flight.price) + Number(flight.taxes || 0) + Number(flight.services || 0)
        ));
        
        console.log(`💰 Date ${dateString}: Using real price ${price}`);
        
        data.push({
          date: dateString,
          dayName: dayNames[date.getDay()],
          dayNumber: date.getDate().toString().padStart(2, '0'),
          monthNumber: (date.getMonth() + 1).toString().padStart(2, '0'),
          price: price,
          isSelected: index === 0, // First date is selected
          isLowest: false, // Will be calculated below
          isHighest: false // Will be calculated below
        });
      });
      
      // Find lowest and highest prices
      const prices = data.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      data.forEach(day => {
        day.isLowest = day.price === minPrice;
        day.isHighest = day.price === maxPrice;
      });
      
      setPriceData(data);
    };

    generatePriceData();
  }, [language, flights]);

  // Convert English numbers to Persian
  const formatNumbers = (str: string): string => {
    if (language === 'en') {
      return str; // Keep English numbers for English language
    }
    // Convert to Persian numbers for Persian language
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, (digit) => persianNumbers[parseInt(digit)]);
  };

  const formatPrice = (price: number): string => {
    const formattedPrice = (price / 1000000).toFixed(1);
    return formatNumbers(formattedPrice);
  };

  const getDateClasses = (day: PriceCalendarData) => {
    let classes = 'flex-shrink-0 text-center p-3 rounded-lg cursor-pointer transition-colors w-24 h-32 flex flex-col items-center justify-center border-2';
    
    if (day.isSelected) {
      classes += ' border-blue-500 bg-blue-50';
    } else if (day.isLowest) {
      classes += ' border-green-200 bg-green-50';
    } else if (day.isHighest) {
      classes += ' border-red-200 bg-red-50';
    } else {
      classes += ' border-gray-200 hover:bg-gray-50';
    }
    
    return classes;
  };

  const handleDateClick = (day: PriceCalendarData) => {
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = direction === 'prev' ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(1, newWeek)); // Limit to 0-1 weeks
    });
  };

  const visibleDays = priceData.slice(currentWeek * 7, (currentWeek + 1) * 7);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <span className="text-xs text-gray-500">i</span>
          <h3 className="text-lg font-bold text-gray-800">{language === 'en' ? 'Price Calendar' : 'تقویم قیمتی'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600">{language === 'en' ? 'Close' : 'بستن'}</span>
          <ChevronDownIcon className="w-4 h-4 text-blue-600 rotate-180" />
        </div>
      </div>
      
      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        <button 
          onClick={() => navigateWeek('prev')}
          disabled={currentWeek === 0}
          className="flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-90" />
        </button>
        
        <div className="flex gap-4 justify-center flex-1">
          {visibleDays.map((day, index) => (
            <div
              key={day.date}
              className={getDateClasses(day)}
              onClick={() => handleDateClick(day)}
            >
              <div className="text-xs text-gray-500 mb-0.5">
                {day.dayName}
              </div>
              <div className="text-sm font-medium mb-0.5">
                {formatNumbers(day.dayNumber)}/{formatNumbers(day.monthNumber)}
              </div>
              <div className="text-xs text-gray-500 mb-0.5">
                {formatNumbers(day.dayNumber)} {language === 'en' ? 
                  new Date(day.date).toLocaleDateString('en-US', { month: 'short' }) :
                  new Date(day.date).toLocaleDateString('fa-IR', { month: 'short' })
                }
              </div>
              <div className={`text-lg font-bold mb-0.5 ${
                day.isHighest ? 'text-red-500' : 
                day.isLowest ? 'text-green-500' : 
                'text-gray-800'
              }`}>
                {formatPrice(day.price)}
              </div>
              <div className="text-xs text-gray-500">
                {language === 'en' ? 'Million Toman' : 'میلیون تومان'}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => navigateWeek('next')}
          disabled={currentWeek === 1}
          className="flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDownIcon className="w-4 h-4 text-gray-400 -rotate-90" />
        </button>
      </div>
    </div>
  );
};
