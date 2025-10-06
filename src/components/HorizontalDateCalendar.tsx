import React, { useState, useEffect } from 'react';
import moment from 'jalali-moment';

interface HorizontalDateCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  from?: string;
  to?: string;
}

interface DayPrice {
  date: string;
  price: number;
  isLowest: boolean;
}

export const HorizontalDateCalendar: React.FC<HorizontalDateCalendarProps> = ({
  selectedDate,
  onDateSelect,
  from,
  to
}) => {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [dailyPrices, setDailyPrices] = useState<DayPrice[]>([]);

  const generateWeekDates = (centerDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(centerDate);
    startOfWeek.setDate(centerDate.getDate() - 3); // Start 3 days before

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getPersianDayName = (date: Date) => {
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return dayNames[date.getDay()];
  };

  const formatPersianDate = (date: Date) => {
    const jMoment = moment(date);
    const month = jMoment.jMonth() + 1;
    const day = jMoment.jDate();
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('fa-IR');
  };

  const fetchDailyPrices = async () => {
    const prices: DayPrice[] = [];
    const flightPrices = {
      '2025-09-20': 2375, // Thursday (2,375) - selected in image
      '2025-09-21': 2286, // Friday (2,286)
      '2025-09-22': 2256, // Saturday (2,256)
      '2025-09-23': 2361, // Sunday (2,361)
      '2025-09-24': 2982, // Monday (2,982)
      '2025-09-25': 3876, // Tuesday (3,876)
      '2025-09-26': 3578, // Wednesday (3,578)
    };

    currentWeek.forEach((date) => {
      const dateString = date.toISOString().split('T')[0];
      const priceKey = dateString as keyof typeof flightPrices;
      const price = flightPrices[priceKey] || Math.floor(Math.random() * 2000) + 1500;

      prices.push({
        date: dateString,
        price,
        isLowest: false
      });
    });

    setDailyPrices(prices);
  };

  useEffect(() => {
    const weekDates = generateWeekDates(selectedDate);
    setCurrentWeek(weekDates);
  }, [selectedDate]);

  useEffect(() => {
    if (currentWeek.length > 0) {
      fetchDailyPrices();
    }
  }, [currentWeek]);

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newCenterDate = new Date(selectedDate);
    newCenterDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    const weekDates = generateWeekDates(newCenterDate);
    setCurrentWeek(weekDates);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Navigation Arrow Left */}
        <button
          onClick={() => navigateWeek('prev')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Week Dates */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {currentWeek.map((date, index) => {
            const dayPrice = dailyPrices.find(dp => dp.date === date.toISOString().split('T')[0]);
            const isSelected = date.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-w-[70px]
                  ${isSelected
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-50 bg-white'
                  }
                `}
              >
                {/* Day name */}
                <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                  {getPersianDayName(date)}
                </div>

                {/* Date */}
                <div className={`text-lg font-bold mb-2 ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                  {formatPersianDate(date)}
                </div>

                {/* Price */}
                {dayPrice && (
                  <div className="text-sm font-medium text-green-600">
                    {formatPrice(dayPrice.price)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={() => navigateWeek('next')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
